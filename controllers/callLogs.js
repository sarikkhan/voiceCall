const express = require("express");
const firestore = require("firebase/firestore");
const fireAuth = require("firebase/auth");
const { async } = require("@firebase/util");
const {
  getDocs,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} = require("firebase/firestore");

const auth = fireAuth.getAuth();

const db = firestore.getFirestore();

module.exports.frequentlyCalled = async function (req, res, next) {
  const user = req.cookies.user_uid;
  if (user) {
    console.log("user logged in ");
    try {
      const docReceivedRef = query(
        collection(doc(collection(db, user), "call-logs"), "logs"),
        orderBy("name", "desc")
      );
      const counts = {};
      const docReceived = await getDocs(docReceivedRef);
      docReceived.forEach((docData) => {
        const name = docData.data().name;
        if (!counts[name]) {
          counts[name] = 0;
        }
        counts[name]++;
      });
      const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

      // console.log(docC);
      return res.render("frequently_called", {
        title: "Sarik",
        logs: sortedCounts,
      });
    } catch (err) {
      console.log("error iccured", err);
      return res.redirect("/");
    }
  } else {
    console.log("No user is currently signed in");
    return res.render("home", {
      title: "Sarik",
    });
  }
};

module.exports.callHistory = async function (req, res, next) {
  const user = req.cookies.user_uid;
  if (user) {
    console.log("user logged in ");
    try {
      const docReceivedRef = query(
        collection(doc(collection(db, user), "call-logs"), "logs"),
        orderBy("createdAt", "desc")
      );

      const docReceived = await getDocs(docReceivedRef);
      // console.log(docC);
      return res.render("call-history", {
        title: "Sarik",
        logs: docReceived,
      });
    } catch (err) {
      console.log("error iccured", err);
      return res.redirect("/");
    }
  } else {
    console.log("No user is currently signed in");
    return res.render("home", {
      title: "Sarik",
    });
  }
};

module.exports.newCall = function (req, res, next) {
  const userId = req.cookies.user_uid;
  if (userId) {
    res.setHeader("Content-Type", "*/*");
    return res.render("room", {
      roomId: req.params.room,
      userId: userId,
    });
  } else {
    return res.redirect("/");
  }
  // }
};

module.exports.addData = async function (
  currentUserId,
  duration,
  startTime,
  type,
  otherUserId,
  roomId
) {
  if (duration == "0") {
    SettingLogs(currentUserId, type, 0, startTime, "NAN", roomId);
    return;
  }
  await getUserName(otherUserId).then((name) => {
    SettingLogs(currentUserId, type, duration, startTime, name, roomId);
  });

  if (type == "called") type = "received";
  else type = "called";

  await getUserName(currentUserId)
    .then((name) => {
      SettingLogs(otherUserId, type, duration, startTime, name, roomId);
    })
    .catch((err) => {
      console.log("error occured", err);
      return err;
    });
};

async function getUserName(userId) {
  const collecUser = collection(db, userId);
  const docRefUser = doc(collecUser, "info");
  try {
    const docC = await getDoc(docRefUser);
    return docC.data().name;
  } catch (err) {
    console.log("error occurred", err);
    return "error occurred while accessing firebase";
  }
}

async function SettingLogs(userId, type, duration, startTime, name, roomId) {
  console.log("hello", userId, duration, startTime, type, roomId);
  const collec = collection(db, userId);
  const docRef = doc(collec, "call-logs");
  const collecRef = collection(docRef, "logs");
  const docRef2 = doc(collecRef, roomId);

  try {
    await setDoc(docRef2, {
      duration: duration.toString(),
      startTime: startTime.toString(),
      type: type,
      name: name,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.log("error occured ", err);
    return err;
  }
}

module.exports.addContact = async function (userId, otherUserId) {
  const docRef = doc(
    collection(doc(collection(db, userId), "contacts"), "contactsList"),
    otherUserId
  );
  const name = await getUserName(otherUserId);
  try {
    await setDoc(docRef, { name: name });
  } catch (err) {
    console.log("error occured ", err);
    return err;
  }

  const docRef2 = doc(
    collection(doc(collection(db, otherUserId), "contacts"), "contactsList"),
    userId
  );

  const name2 = await getUserName(userId);
  try {
    await setDoc(docRef2, { name: name2 });
  } catch (err) {
    console.log("error occured ", err);
    return err;
  }
};

module.exports.contactList = async function (req, res, next) {
  const user = req.cookies.user_uid;
  if (user) {
    if (user) {
      console.log("user logged in ");
      try {
        const docRef = collection(
          doc(collection(db, user), "contacts"),
          "contactsList"
        );
        const docC = await getDocs(docRef);
        // console.log(docC);
        return res.render("contact-list", {
          title: "Sarik",
          logs: docC,
        });
      } catch (err) {
        console.log("error iccured", err);
        return res.redirect("/");
      }
    } else {
      console.log("No user is currently signed in");
      return res.render("home", {
        title: "Sarik",
      });
    }
  }
};
