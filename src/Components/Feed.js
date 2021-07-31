import React, { useEffect, useState } from "react";
import Header from "./Header";
import Bottombar from "./BottomBar";
import "./Feed.css";
import Posts from "./Posts";
import Loading from "./Loading";
import NavBar from "./NavBar";
import { database } from "../firebase";
import { useAuth } from "../Context/AuthContext";
import CircularProgress from "@material-ui/core/CircularProgress";
import UploadFile from "./UploadFile";
export default function Feed() {
  const [userData, setUserData] = useState(null);
  const { currentUser } = useAuth();
  useEffect(() => {
    const unsub = database.users.doc(currentUser.uid).onSnapshot((doc) => {
      // doc.data() is never undefined for query doc snapshots
      setUserData(doc.data());
    });
    return () => {
      unsub();
    };
  }, [currentUser]);
  return (
    <>
      {/* This check is important because without this the condition that we are using in our likes
        component will always give us a false value as that component will be rendered withput any user data
        so there will not be any id to compare to */}
      {userData == null ? (
        <Loading />
      ) : (
        <>
          {/* <Header userData={userData} /> */}
          <NavBar userData={userData}></NavBar>
          <div className="portion" style={{ height: "9.5vh" }}></div>
          <div className="feed-container">
            <div className="center">
              {/* <UploadFile userData={userData} /> */}
              <Posts userData={userData} />
            </div>
          </div>
          <Bottombar profile={userData}></Bottombar>
        </>
      )}
    </>
  );
}
