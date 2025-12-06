import { useState, useEffect } from "react";
import "./styles/style_admincomments.css";
import { commentAdminGetCommentsByPage } from "../api/ApiComments";
import type { Comment, CommentPageResponse } from "../api/ApiComments";
import type ApiResponse from "../api/ApiResponse";

const AdminComments = () => {
  return (
      <div className="admin-comments-container">

      </div>
  );
};

export default AdminComments;
