import "../assets/normalise.css"
import "./styles/style_postdialog.css"
import { XMarkIcon } from "@heroicons/react/20/solid"

const PostDialog = () => {
    return (
        <div className="post-dialog-cover">
            <div className="post-dialog-container">
                <div className="post-dialog-header">
                    <XMarkIcon className="post-dialog-close" />
                    <h2 className="post-dialog-title">Create New Post</h2>
                </div>
                <div className="tool-box">
                    {/* Reserved for future markdown editor */}
                </div>
                <div className="post-dialog-body">
                    <input 
                        type="text" 
                        className="post-dialog-input"
                        placeholder="Post title (optional)"
                    />
                    <textarea
                        className="post-dialog-textarea"
                        placeholder="What's on your mind?"
                    ></textarea>
                </div>
                <div className="post-dialog-footer">
                    <div className="post-dialog-footer-left">
                        <button className="post-dialog-select-club">
                            #Club
                        </button>
                    </div>
                    <div>
                        <button className="post-dialog-cancel">Cancel</button>
                        <button className="post-dialog-submit">Post</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDialog;
