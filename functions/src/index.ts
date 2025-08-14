
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/document";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

admin.initializeApp();

// This function checks for duplicate squad names before a registration is created.
exports.checkDuplicateRegistration = onCall({enforceAppCheck: false}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated to register.");
    }

    const { tournament_id, squad_name_lowercase } = request.data;
    if (!tournament_id || !squad_name_lowercase) {
        throw new HttpsError("invalid-argument", "Tournament ID and squad name are required.");
    }
    
    try {
        const snapshot = await admin.firestore()
            .collection("registrations")
            .where("tournament_id", "==", tournament_id)
            .where("squad_name_lowercase", "==", squad_name_lowercase)
            .limit(1)
            .get();

        return { duplicateFound: !snapshot.empty };

    } catch (error) {
        logger.error("Error checking for duplicate registration:", error);
        throw new HttpsError("internal", "An error occurred while checking for duplicate registration.");
    }
});


exports.checkDuplicatePlayerIds = onCall({enforceAppCheck: false}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be signed in.");
  }

  const { tournamentId, playerIds } = request.data;
  if (!tournamentId || !playerIds || !Array.isArray(playerIds)) {
    throw new HttpsError("invalid-argument", "Invalid parameters: tournamentId and playerIds are required.");
  }

  try {
      const snapshot = await admin.firestore()
        .collection("registrations")
        .where("tournament_id", "==", tournamentId)
        .where("player_ids", "array-contains-any", playerIds)
        .get();

      return { duplicateFound: !snapshot.empty };
  } catch(error) {
    logger.error("Error checking for duplicate player IDs:", error);
    throw new HttpsError("internal", "An error occurred while checking for duplicate player IDs.");
  }
});
