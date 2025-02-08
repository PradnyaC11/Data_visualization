import React from "react";
import "../styles/HeaderSection.css";

const HeaderSection = () => {

    return (
        <div className="head-section">
            <div className="text head--text">
                Analyzing Air Travel Patterns, Safety Trends, and Accident Causes in U.S. Aviation
            </div>

                <div className="head-summary">
                    Explore the story of how data reveals trends in passenger growth, flight efficiency, 
                    and the technological innovations shaping safer skies.
                </div>
                
                <div className="head-by head-by-main">
                    <p className="head-by-author">
                        Madhura Wani <span className="author-email">mwani2@asu.edu</span>
                    </p>
                    <p className="head-by-author">
                        Pradnya Chaudhari <span className="author-email">pchaud21@asu.edu</span>
                    </p>
                    <p className="head-by-author">
                        Sairaj Shetye <span className="author-email">sshetye2@asu.edu</span>
                    </p>
                    <p className="head-by-author">
                        Vaishnavi Gadhikar <span className="author-email">vgadhika@asu.edu</span>
                    </p>
                </div>
            
        </div>
    );
}

export default HeaderSection;
