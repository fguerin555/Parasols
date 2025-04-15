import React, { useState } from "react";
import { db } from "../../Firebase";
import { collection, addDoc, query, getDocs } from "firebase/firestore";
import { generateSerialNumber } from "../../utils/bookingUtils/serialNumberGenerator";
import {
  checkCabinaAvailability,
  getNextCabinaLetter,
} from "../../utils/bookingUtils/cabinaUtils";
import "../../Global.css";
import styles from "./Booking.module.css";

const Booking = () => {
  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Transformer en majuscules pour nom et prénom
    if (id === "nome" || id === "cognome") {
      const capitalizedValue = value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      setFormData({ ...formData, [id]: capitalizedValue });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

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

  const handleLettiChange = (e) => {
    const { id, value } = e.target;
    if (value === "" || value === "2" || value === "3") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const checkParasolAvailability = async (
    numeroOmbrello,
    startDate,
    endDate
  ) => {
    if (!numeroOmbrello || !startDate || !endDate) return true;

    const prenotazioniRef = collection(db, "prenotazioni");
    const q = query(prenotazioniRef);
    const querySnapshot = await getDocs(q);

    const checkStart = new Date(startDate);
    const checkEnd = new Date(endDate);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const reservationStart = new Date(data.primoGiorno);
      const reservationEnd = new Date(data.ultimoGiorno);

      // Vérifier si les dates se chevauchent
      if (!(checkEnd < reservationStart || checkStart > reservationEnd)) {
        // Comparaison exacte des numéros de parasol
        if (data.numeroOmbrello === numeroOmbrello) {
          return false;
        }
      }
    }
    return true;
  };

  const handleOmbrelloChange = async (e) => {
    const { id, value } = e.target;
    const upperValue = value.toUpperCase();

    // Validation des caractères
    const validChars = /^[A-D0-9]*$/;
    if (!validChars.test(upperValue)) return;

    // Toujours mettre à jour l'input visuellement
    setFormData((prev) => ({
      ...prev,
      [id]: upperValue,
    }));

    // Si la valeur saisie n'est pas complète, on ne vérifie pas encore
    const validFormat = /^[A-D]([1-9]|[12][0-9]|3[0-6])$/;
    if (validFormat.test(upperValue)) {
      const isAvailable = await checkParasolAvailability(
        upperValue,
        formData.primoGiorno,
        formData.ultimoGiorno
      );
      if (!isAvailable) {
        alert(`Le parasol ${upperValue} est déjà réservé pour ces dates`);
        // Vider le champ si réservé
        setFormData((prev) => ({
          ...prev,
          [id]: "",
        }));
      }
    }
  };

  const handleCabinaChange = async (e) => {
    const { id, value } = e.target;
    if (value === "" || value === "0" || value === "1") {
      if (value === "1") {
        const isAvailable = await checkCabinaAvailability(formData.primoGiorno);
        if (!isAvailable) {
          alert("Désolé, toutes les cabines sont occupées pour cette date");
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Vérification des doublons
      const parasols = [
        formData.numeroOmbrello1,
        formData.numeroOmbrello2,
        formData.numeroOmbrello3,
      ].filter(Boolean);

      const duplicates = parasols.filter(
        (item, index) => parasols.indexOf(item) !== index
      );
      if (duplicates.length > 0) {
        alert(
          `Erreur : Le parasol ${duplicates[0]} est sélectionné plusieurs fois`
        );
        return;
      }

      const usedLetters = new Set();
      const cabinaResults = {
        // Initialiser avec des valeurs par défaut
        cabinaLetter1: null,
        cabinaLetter2: null,
        cabinaLetter3: null,
      };

      const serialNumber = await generateSerialNumber();

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
        cabinaLetter1: cabinaResults.cabinaLetter1 || "-",
        cabinaLetter2: cabinaResults.cabinaLetter2 || "-",
        cabinaLetter3: cabinaResults.cabinaLetter3 || "-",
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
