import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import styles from "../styles/components.module.css";

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const navigate = useNavigate();

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: "customer",
      title: "Customer Care",
      content: (
        <>
          <p>123 Example St, Example City, EX 12345</p>
          <p>Example City, EX 67890</p>
          <p className={styles.footerPhone}>+1 (000) 000-0000‬</p>
          <p>contact@example.com</p>

          <div className={styles.footerSocials}>
            {[
              { Icon: FaFacebook, url: "https://www.facebook.com/" },
              { Icon: FaInstagram, url: "https://www.instagram.com/" },
              { Icon: FaTwitter, url: "https://twitter.com/" },
              { Icon: FaYoutube, url: "https://www.youtube.com/" },
            ].map(({ Icon, url }, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "find",
      title: "Find It Fast",
      content: [
        { label: "About Us", path: "/about-us" },
        { label: "Privacy Policy", path: "/privacy-policy" },
        { label: "Terms and Conditions", path: "/terms-and-conditions" },
        { label: "Contact Us", path: "/contact-us" },
      ].map((item, i) => (
        <p
          key={i}
          className={styles.footerLink}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </p>
      )),
    },
    {
      id: "other",
      title: "Other Business",
      content: [
        { label: "My Account", path: "/account" },
        { label: "Track Order", path: "/track-order" },
        { label: "Wishlist", path: "/wishlist" },
        { label: "FAQ", path: "/faq" },
        { label: "Returns / Refund", path: "/refund-returns" },
      ].map((item, i) => (
        <p
          key={i}
          className={styles.footerLink}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </p>
      )),
    },
    {
      id: "newsletter",
      title: "Stay Updated",
      content: (
        <>
          <p className={styles.newsletterText}>
            Subscribe to get updates on offers and deals.
          </p>
          <div className={styles.newsletterBox}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.newsletterInput}
            />
            <button className={styles.newsletterButton}>Subscribe</button>
          </div>
        </>
      ),
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {sections.map((section) => (
          <div key={section.id} className={styles.footerSection}>
            <h3
              onClick={() => toggleSection(section.id)}
              className={styles.footerTitle}
            >
              {section.title}
              <span className={styles.accordionIcon}>
                {openSection === section.id ? "-" : "+"}
              </span>
            </h3>

            <div
              className={
                openSection === section.id
                  ? styles.footerContentOpen
                  : styles.footerContent
              }
            >
              {section.content}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footerBottom}>
        © {new Date().getFullYear()} Example Company, Inc — All rights reserved
      </div>
    </footer>
  );
}
