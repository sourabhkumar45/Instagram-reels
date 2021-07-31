import React, { useState, useContext } from "react";

import { v4 as uuidv4 } from "uuid";

import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import FavouriteIcon from "@material-ui/icons/Favorite";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import { database, storage } from "../firebase";
import { useAuth } from "../Context/AuthContext";
import { makeStyles, Grid, IconButton } from "@material-ui/core";

import { PhotoCamera } from "@material-ui/icons/";

function Bottombar(props) {
  let useStyles = makeStyles({
    input: {
      display: "none",
    },
    centerDivs: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    centerDivsC: {
      width: "20%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    navContainer: {
      position: "fixed",
      bottom: "0",
      zIndex: "9",
      background: "white",
      width: "100vw",
      minHeight: "7vh",
      borderTop: "1px solid #dbdbdb",
      margin: "0",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
    },
    instaIcon: {
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    bottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4rem",
    },
  });
  let classes = useStyles();
  let user = props.profile;
  const [loading, setLoading] = useState(false);
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      setLoading(true);
      // auth provider
      await logout();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const handleInputFile = (e) => {
    e.preventDefault();
    let pid = uuidv4();
    let file = e?.target?.files[0];
    if (file != null) {
      console.log(e.target.files[0]);
    }
    //
    if (file.size / (1024 * 1024) > 20) {
      alert("The selected file is very big");
      return;
    }
    // 1. upload
    const id = uuidv4();
    const uploadTask = storage
      .ref(`/posts/${currentUser.uid}/${pid}`)
      .put(file);
    setLoading(true);
    //   progress
    const f1 = (snapshot) => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes;
      console.log(progress);
      //this callback is for providing the progress
    };
    // err
    const f2 = () => {
      alert("There was an error in uploading the file");
      return;
    };
    // success
    const f3 = () => {
      uploadTask.snapshot.ref.getDownloadURL().then(async (url) => {
        // 2.
        // post collection -> post document put

        let obj = {
          comments: [],
          likes: [],
          pId: id,
          pUrl: url,
          uName: user?.fullName,
          uProfile: user?.profileUrl,
          userId: user?.userId,
          createdAt: database.getCurrentTimeStamp(),
        };
        //   put the post object into post collection
        let postObj = await database.posts.add(obj);
        // 3. user postsId -> new post id put

        await database.users.doc(currentUser.uid).update({
          postIds: [...user.postIds, postObj.id],
        });
        // console.log(postObj);
        setLoading(false);
      });
    };
    uploadTask.on("state_changed", f1, f2, f3);
  };
  return (
    <Grid container className={classes.navContainer} sm={12} xs={12}>
      <Grid item sm={9} className={classes.bottom}>
        <Grid item>
          <div>
            <input
              accept="video/*"
              className={classes.input}
              id="icon-button-file"
              type="file"
              onChange={handleInputFile}
            />
            <label htmlFor="icon-button-file">
              <IconButton aria-label="upload picture" component="span">
                <PhotoCamera disabled={loading} />
              </IconButton>
            </label>
          </div>
        </Grid>
        <Grid item>
          <ChatBubbleIcon />
        </Grid>
        <Grid item>
          <FavouriteIcon />
        </Grid>
        <Grid item>
          <ExitToAppIcon onClick={handleLogout} disabled={loading} />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Bottombar;
