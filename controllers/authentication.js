const express = require("express");
const { updateProfile } = require("firebase/auth");
const fireAuth = require("firebase/auth");
const {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDoc,
} = require("firebase/firestore");

const auth = fireAuth.getAuth();
const db = getFirestore();

module.exports.create = function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  fireAuth
    .createUserWithEmailAndPassword(auth, email, password)
    .then((credential) => {
      const user = auth.currentUser;

      if (user != null) {
        updateProfile(user, { displayName: name })
          .then(() => {
            res.cookie("user_uid", user.uid, {
              maxAge: 900000,
              httpOnly: true,
            });
            const collec = collection(db, user.uid);
            const docRef = doc(collec, "info");
            try {
              setDoc(docRef, {
                email: email,
                name: name,
              });
              return res.redirect("/profile");
            } catch (err) {
              return res.redirect("/");
            }
          })
          .catch((err) => {
            console.log(err);
            return res.render("error", {
              title: "Sarik",
              error: err.code,
            });
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.render("error", {
        title: "Sarik",
        error: err.code,
      });
    });
};

module.exports.createSession = function (req, res, next) {
  const email = req.body.email;
  // console.log(email);
  const password = req.body.password;

  fireAuth
    .setPersistence(auth, fireAuth.browserLocalPersistence)
    .then(() => {
      fireAuth
        .signInWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          //   user = cred.user;
          console.log(auth.currentUser.uid);
          res.cookie("user_uid", auth.currentUser.uid, {
            maxAge: 900000,
            httpOnly: true,
          });
          //   console.log("its the authentication user", user);
          return res.redirect("/profile");
        })
        .catch((err) => {
          return res.render("error", {
            title: "Sarik",
            error: err.code,
          });
        });
      // Session persistence successfully set
    })
    .catch((error) => {
      console.log("error");
      return res.render("home", {
        title: "Sarik",
      });
    });
};

module.exports.signUp = function (req, res, next) {
  const user = req.cookies.user_uid;
  if (user) {
    return res.redirect("/profile");
  } else {
    return res.render("user_sign_up", {
      title: "Voice Calling Sign_up",
    });
  }
};

module.exports.profile = async function (req, res, next) {
  const user = req.cookies.user_uid;
  console.log(user);
  // const user = auth.currentUser;
  if (user) {
    const collec = collection(db, user);
    const docRef = doc(collec, "info");
    await getDoc(docRef)
      .then((docC) => {
        console.log(docC.data());
        return res.render("user_profile", {
          title: docC.name,
          user: docC.data(),
        });
      })
      .catch((err) => {
        console.log("error occured", err);
        return res.redirect("/");
      });
  } else {
    return res.redirect("/");
  }
};

module.exports.signOut = function (req, res, next) {
  const user = req.cookies.user_uid;
  // const user = auth.currentUser;
  if (user) {
    auth.signOut().then(() => {
      res.clearCookie("user_uid");
      return res.redirect("/");
    });
  } else {
    return res.redirect("/profile");
  }
};

module.exports.home = function (req, res, next) {
  const user = req.cookies.user_uid;
  if (user) {
    return res.redirect("/profile");
  } else
    return res.render("home", {
      title: "Sarik",
    });
};
