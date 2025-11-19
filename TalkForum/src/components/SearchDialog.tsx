import { useState, useEffect } from "react";
// import "../assets/normalize.css"
import "./styles/style_searchdialog.css"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

interface SearchDialogProps {
    onClose: () => void;
}

const SearchDialog = (props : SearchDialogProps) => {
    const { onClose } = props;
    const [isClosing, setIsClosing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    const closeSearchDialog = () => {
        if (!isMounted) return;
        
        setIsClosing(true);
        const timer = setTimeout(() => {
            if (isMounted) {
                onClose();
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeSearchDialog();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return <div className={`cover ${isClosing ? 'closing' : ''}`}>
        <div className="header">
            <ArrowLeftIcon onClick={closeSearchDialog} style={{cursor: 'pointer'}}></ArrowLeftIcon>
            <div className="combo">
                <MagnifyingGlassIcon />
                <input type="text" placeholder="search something..." />
            </div>
            <button>Search</button>
        </div>
        <div className="content">
            <h2>Hot Topics</h2>
            <p><span>Computer Science</span> <span>Caculors</span> <span>Dishes</span> </p>
            <h2>Search History</h2>
            <p> <span>Cheat</span> </p>
        </div>
    </div>
};

export default SearchDialog;
