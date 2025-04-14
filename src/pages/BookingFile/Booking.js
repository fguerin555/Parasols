import React, { useState } from "react";
import { db } from "../../Firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { generateSerialNumber } from "../../utils/bookingUtils";
import {
  checkCabinaAvailability,
  getNextCabinaLetter,
} from "../../utils/bookingUtils/cabinaUtils";
import "../../Global.css";
import styles from "./Booking.module.css";

// Ajoutez cette fonction au début du composant pour capitaliser
const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Ajoutez cette fonction de vérification avant le composant Booking
const checkParasolAvailability = async (numeroOmbrello, startDate, endDate) => {
  if (!numeroOmbrello) return true;

  const reservationsRef = collection(db, "reservations");
  const q = query(reservationsRef, where("status", "==", "active"));

  const querySnapshot = await getDocs(q);

  // Vérification pour chaque réservation
  for (const doc of querySnapshot.docs) {
    const reservation = doc.data();

    // Vérifie si les dates se chevauchent
    if (
      reservation.primoGiorno <= endDate &&
      reservation.ultimoGiorno >= startDate
    ) {
      // Vérifie si le parasol est déjà utilisé dans cette réservation
      const usedOmbrellos = [
        reservation.numeroOmbrello1,
        reservation.numeroOmbrello2,
        reservation.numeroOmbrello3,
      ].filter(Boolean); // Supprime les valeurs null/undefined/empty

      // Compare les numéros de parasols en ignorant les espaces et la casse
      if (
        usedOmbrellos.some(
          (usedOmbrello) =>
            usedOmbrello.replace(/\s+/g, "").toUpperCase() ===
            numeroOmbrello.replace(/\s+/g, "").toUpperCase()
        )
      ) {
        return false; // Parasol déjà réservé
      }
    }
  }

  return true; // Parasol disponible
};

// Ajoutez cette fonction pour générer le numéro de série

const Booking = () => {
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    cognome: "",
    nome: "",
    email: "",
    telefono: "",
    primoGiorno: new Date().toISOString().split("T")[0],
    ultimoGiorno: new Date().toISOString().split("T")[0],
    timeday: "",
    numeroOmbrello1: "", // Vide par défaut
    numeroOmbrello2: "", // Vide par défaut
    numeroOmbrello3: "", // Vide par défaut
    lettiOmbrello1: "2",
    lettiOmbrello2: "2",
    lettiOmbrello3: "2",
    cabina1: "0", // Nouvelles propriétés
    cabina2: "0",
    cabina3: "0",
  });

  // Gestion des changements dans les inputs
  const handleChange = (e) => {
    const { id, value } = e.target;

    // Gestion spéciale pour Cognome et Nome
    if (id === "cognome" || id === "nome") {
      setFormData((prev) => ({
        ...prev,
        [id]: capitalize(value),
      }));
      return;
    }

    // Gestion spéciale pour les dates
    if (id === "primoGiorno") {
      setFormData((prev) => ({
        ...prev,
        primoGiorno: value,
        ultimoGiorno: prev.ultimoGiorno < value ? value : prev.ultimoGiorno,
      }));
      return;
    }

    if (id === "ultimoGiorno") {
      if (value < formData.primoGiorno) {
        alert("La date de fin ne peut pas être antérieure à la date de début");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        ultimoGiorno: value,
      }));
      return;
    }

    // Gestion par défaut pour les autres champs
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Gestion spéciale pour l'input I/M/P
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (!["I", "M", "P"].includes(value)) {
      e.target.value = "";
      return;
    }
    setFormData((prev) => ({
      ...prev,
      timeday: value,
    }));
  };

  // Après les autres fonctions de gestion
  const handleOmbrelloChange = async (e) => {
    const { id, value } = e.target;
    const upperValue = value.toUpperCase();

    // Permet uniquement les caractères valides
    const validChars = /^[A-D0-9]*$/;
    if (!validChars.test(upperValue)) {
      return;
    }

    // Vérification du format complet modifiée
    if (upperValue) {
      // Format: lettre A-D suivie d'un nombre de 1 à 36
      const validFormat = /^[A-D]([1-9]|[12][0-9]|3[0-6])$/;

      // Si la valeur est complète (format correct)
      if (validFormat.test(upperValue)) {
        const isAvailable = await checkParasolAvailability(
          upperValue,
          formData.primoGiorno,
          formData.ultimoGiorno
        );

        if (!isAvailable) {
          alert(`Le parasol ${upperValue} est déjà réservé pour ces dates`);
          return;
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [id]: upperValue,
    }));
  };

  // Modifiez la fonction handleLettiChange
  const handleLettiChange = (e) => {
    const { id, value } = e.target;

    // N'accepte que 2 ou 3
    if (value === "" || value === "2" || value === "3") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleCabinaChange = async (e) => {
    const { id, value } = e.target;

    // N'accepte que 0 ou 1 ou champ vide
    if (value === "" || value === "0" || value === "1") {
      // Si on veut attribuer une cabine (value === "1")
      if (value === "1") {
        // Vérifier la disponibilité des cabines pour la date donnée
        const isAvailable = await checkCabinaAvailability(formData.primoGiorno);

        if (!isAvailable) {
          alert("Désolé, toutes les cabines sont occupées pour cette date");
          return;
        }

        // Vérifier si un numéro de parasol correspondant est saisi
        const ombrelloNum =
          id === "cabina1"
            ? formData.numeroOmbrello1
            : id === "cabina2"
            ? formData.numeroOmbrello2
            : formData.numeroOmbrello3;

        if (!ombrelloNum) {
          alert("Veuillez d'abord saisir le numéro de parasol correspondant");
          return;
        }
      }

      // Mettre à jour le state si toutes les vérifications sont passées
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // Modifiez la fonction handleSubmit pour s'assurer que le status est correctement défini
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const serialNumber = await generateSerialNumber();
      if (!serialNumber) {
        alert("Erreur lors de la génération du numéro de série");
        return;
      }

      // Validation des champs obligatoires
      if (
        !formData.cognome ||
        !formData.nome ||
        !formData.primoGiorno ||
        !formData.ultimoGiorno ||
        !formData.timeday ||
        !formData.numeroOmbrello1
      ) {
        alert("Veuillez remplir les champs obligatoires");
        return;
      }

      // Gestion des cabines avec un Set pour suivre les lettres déjà attribuées
      const usedLetters = new Set();
      let cabinaResults = {
        cabinaLetter1: null,
        cabinaLetter2: null,
        cabinaLetter3: null,
      };

      // Fonction pour obtenir la prochaine lettre en tenant compte des lettres déjà utilisées
      const getNextAvailableLetter = async (date) => {
        const letter = await getNextCabinaLetter(date);
        if (usedLetters.has(letter)) {
          // Si la lettre est déjà utilisée, on simule une cabine occupée
          const allLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
          for (let l of allLetters) {
            if (!usedLetters.has(l)) {
              usedLetters.add(l);
              return l;
            }
          }
        }
        usedLetters.add(letter);
        return letter;
      };

      // Attribution séquentielle des cabines
      if (formData.cabina1 === "1") {
        cabinaResults.cabinaLetter1 = await getNextAvailableLetter(
          formData.primoGiorno
        );
      }
      if (formData.cabina2 === "1") {
        cabinaResults.cabinaLetter2 = await getNextAvailableLetter(
          formData.primoGiorno
        );
      }
      if (formData.cabina3 === "1") {
        cabinaResults.cabinaLetter3 = await getNextAvailableLetter(
          formData.primoGiorno
        );
      }

      // Création du document avec les lettres de cabine
      const reservationData = {
        ...formData,
        cabinaLetter1: cabinaResults.cabinaLetter1,
        cabinaLetter2: cabinaResults.cabinaLetter2,
        cabinaLetter3: cabinaResults.cabinaLetter3,
        status: "active",
        serialNumber: serialNumber,
        dateCreation: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(db, "reservations"),
        reservationData
      );

      console.log("Document créé avec l'ID:", docRef.id);
      console.log("Données envoyées:", reservationData);

      alert("Réservation enregistrée avec succès!");

      // Reset du formulaire
      setFormData({
        cognome: "",
        nome: "",
        email: "",
        telefono: "",
        primoGiorno: "",
        ultimoGiorno: "",
        timeday: "",
        numeroOmbrello1: "",
        numeroOmbrello2: "",
        numeroOmbrello3: "",
        lettiOmbrello1: "2",
        lettiOmbrello2: "2",
        lettiOmbrello3: "2",
        cabina1: "0",
        cabina2: "0",
        cabina3: "0",
      });
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <div className={styles.BookingPage}>
        <form className={styles.BookingForm} onSubmit={handleSubmit}>
          <div className={styles.Names}>
            <p>Cognome : </p>
            <input
              type="text"
              placeholder="Cognome Cliente"
              id="cognome"
              maxLength="25"
              value={formData.cognome}
              onChange={handleChange}
            />

            <p>Nome : </p>
            <input
              type="text"
              placeholder="Nome Cliente"
              maxLength="25"
              id="nome"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          <div className={styles.MailPhone}>
            <p>Email : </p>
            <input
              type="email"
              id="email"
              placeholder="Email Cliente"
              value={formData.email}
              onChange={handleChange}
            />

            <p>Telefono : </p>
            <input
              type="tel"
              id="telefono"
              placeholder="Phone Cliente"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className={styles.Booking}>
            <p>Primo giorno : </p>
            <input
              type="date"
              id="primoGiorno"
              value={formData.primoGiorno}
              onChange={handleChange}
            />

            <p>Ultimo giorno: </p>
            <input
              type="date"
              id="ultimoGiorno"
              value={formData.ultimoGiorno}
              onChange={handleChange}
            />
          </div>

          <div className={styles.WholeMorningAfternoon}>
            <p>Giorno Intero : "I"</p>
            <p>Mattina : "M" / Pomerrigio "P"</p>
            <input
              type="text"
              maxLength="1"
              pattern="[IMP]"
              id="timeday"
              style={{ textTransform: "uppercase" }}
              value={formData.timeday}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.OmbrelloSection}>
            <p>Numeri Ombrelli : </p>
            <p>A1-A36, B1-B36, C1-C36, D1-D36</p>
            <div className={styles.OmbrelloInputs}>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="numeroOmbrello1"
                  placeholder="" // Placeholder vide
                  maxLength="3"
                  style={{ textTransform: "uppercase" }}
                  value={formData.numeroOmbrello1}
                  onChange={handleOmbrelloChange}
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="numeroOmbrello2"
                  placeholder="" // Placeholder vide
                  maxLength="3"
                  style={{ textTransform: "uppercase" }}
                  value={formData.numeroOmbrello2}
                  onChange={handleOmbrelloChange}
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="numeroOmbrello3"
                  placeholder="" // Placeholder vide
                  maxLength="3"
                  style={{ textTransform: "uppercase" }}
                  value={formData.numeroOmbrello3}
                  onChange={handleOmbrelloChange}
                />
              </div>
            </div>
            <p className={styles.lettiniTitle}>Lettini</p>
            <div className={styles.OmbrelloInputs}>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="lettiOmbrello1"
                  maxLength="1"
                  pattern="[23]"
                  value={formData.lettiOmbrello1}
                  onChange={handleLettiChange}
                  placeholder="2" // Changé de "2-3" à "2"
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="lettiOmbrello2"
                  maxLength="1"
                  pattern="[23]"
                  value={formData.lettiOmbrello2}
                  onChange={handleLettiChange}
                  placeholder="2" // Changé de "2-3" à "2"
                />
              </div>
              <div className={styles.ombrelloGroup}>
                <input
                  type="text"
                  id="lettiOmbrello3"
                  maxLength="1"
                  pattern="[23]"
                  value={formData.lettiOmbrello3}
                  onChange={handleLettiChange}
                  placeholder="2" // Changé de "2-3" à "2"
                />
              </div>
            </div>
          </div>
          <p className={styles.lettiniTitle}>Cabina</p>
          <div className={styles.OmbrelloInputs}>
            <div className={styles.ombrelloGroup}>
              <input
                type="text"
                id="cabina1"
                maxLength="1"
                pattern="[01]"
                value={formData.cabina1}
                onChange={handleCabinaChange}
                placeholder="0"
              />
            </div>
            <div className={styles.ombrelloGroup}>
              <input
                type="text"
                id="cabina2"
                maxLength="1"
                pattern="[01]"
                value={formData.cabina2}
                onChange={handleCabinaChange}
                placeholder="0"
              />
            </div>
            <div className={styles.ombrelloGroup}>
              <input
                type="text"
                id="cabina3"
                maxLength="1"
                pattern="[01]"
                value={formData.cabina3}
                onChange={handleCabinaChange}
                placeholder="0"
              />
            </div>
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Confirmazione
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
