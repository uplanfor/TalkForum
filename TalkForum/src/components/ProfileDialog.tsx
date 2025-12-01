// import "../assets/normalize.css"
import "./styles/style_profiledialog.css"
import PopUpDialogBase from "./PopUpDialogBase"
import { type PopUpDialogButton } from "./PopUpDialogBase"
import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import { type RootState, type AppDispatch } from "../store";
import { userLogout, userLogin } from "../store/slices/userSlice";
import { Navigate, useNavigate } from "react-router-dom"
import { UserType } from "../constants/default";
import { debounce } from "../utils/debounce&throttle";
import Msg from "../utils/msg";
import { usersChangePasswordAuth, usersUpdateProfileAuth, type UserProfile } from "../api/ApiUsers";

interface ProfileDialogProps {
  onClose: () => void;
}

const ProfileDialog = ({ onClose }: ProfileDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  let showState = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  if (!showState.isLoggedIn) { return <Navigate to="/login" /> }

  
  const handleSubmit =  async(e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) { return; }

    // collect form data
    const formData = new FormData(formRef.current);
    const submitData : UserProfile = {
      name: formData.get("name") as string,
      intro: formData.get("intro") as string,
      avatarLink: formData.get("avatarLink") as string,
      backgroundLink: formData.get("backgroundLink") as string
    };

    await usersUpdateProfileAuth(submitData).then((res) => {
      if (res.success) {
        Msg.success("Profile updated successfully!");
        dispatch(userLogin({...showState,...submitData}));
      } else {
        Msg.error(res.message, 5000);
      }
    });
  };

  const changePassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    changePasswordWithSafety();
  }
  
  // 节流
  const debounceHandleSubmit = debounce(()=>{
      formRef.current?.requestSubmit();
  }, 300);

  const changePasswordWithSafety = debounce(async ()=>{
    if (!oldPasswordRef.current ||!newPasswordRef.current) { return; }
    const oldPassword = oldPasswordRef.current.value;
    const newPassword = newPasswordRef.current.value;
    if (!oldPassword ||!newPassword) {
      Msg.error("Please input your old and new password!");
      return;
    }
    const res = await usersChangePasswordAuth(oldPassword, newPassword);
    if (res.success) {
      Msg.success("Successfully changed your password, please login again!");
      navigate("/login");
      dispatch(userLogout());
    } else {
      Msg.error(res.message, 5000);
    }
  }, 300);

  const bottomBtns: PopUpDialogButton[] = [
    {
      text: "Cancel",
      onClick: () => {
        onClose();
      },
      type: "cancel"
    },
    {
      text: "Commit Profile Changes",
      onClick: debounceHandleSubmit,
      type: "submit"
    }
  ];


  const handleImgBackgroundError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/";
    e.currentTarget.onerror = null;
  };

  const handleImgAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/";
    e.currentTarget.onerror = null;
  };



  return (
    <PopUpDialogBase
      title="My Profile"
      onClose={onClose}
      bottomBtns={bottomBtns}
    >
      <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
        <div className="profile-dialog-container">
          <div className="background-view" onError={handleImgBackgroundError}>
            <img src={showState.backgroundLink} alt="background" />
            <div className="info-card">
              <img src={showState.avatarLink} alt="avatar" onError={handleImgAvatarError}/>
              <div className="combination">
                <h4> <span style={{
                  background: (showState.role == (UserType.ADMIN) ? "var(--primary)" : showState.role == UserType.USER ? "var(--secondary-warm-1)" : "var(--secondary-cool)")
                }}>{showState.role}</span> {showState.name} </h4>
                <p>id : {showState.id}  email : {showState.email}</p>
              </div>
            </div>
          </div>
          <h2>Basic Information</h2>
          <p><label htmlFor="name">Name</label> <input type="text" placeholder="input your name" name="name" id="name" defaultValue={showState.name} /></p>
          <p><label htmlFor="role">Role</label> <input type="text" placeholder="input your role" name="role" id="role" defaultValue={showState.role} disabled /></p>
          <p><label htmlFor="email">Email</label> <input type="text" placeholder="input your email" name="email" id="email" defaultValue={showState.email} disabled /></p>
          <p><label htmlFor="intro">Introduction</label></p> <textarea placeholder="input your intro" name="intro" id="intro" defaultValue={showState.intro} ></textarea>

          <h2>Background and Avatar</h2>
          <p><label htmlFor="avatarLink">Avatar</label> <input type="text" placeholder="input your avatar link" name="avatarLink" id="avatarLink" defaultValue={showState.avatarLink} /></p>
          <p><label htmlFor="backgroundLink">Background</label> <input type="text" placeholder="input your background link" name="backgroundLink" id="backgroundLink" defaultValue={showState.backgroundLink} /></p>

          <h2>Change Password</h2>
          <p><label htmlFor="oldPassword">Old One</label> <input type="password" placeholder="input your old password" name="oldPassword" id="oldPassword" ref={oldPasswordRef}/></p>
          <p><label htmlFor="newPassword">New One</label> <input type="password" placeholder="input your new password" name="newPassword" id="newPassword" ref={newPasswordRef}/></p>
          <button onClick={changePassword}>Change your password</button>
        </div>
      </form>
    </PopUpDialogBase>
  );
};

export default ProfileDialog;