import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { AiFillGithub, AiFillGitlab } from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

const LINKS = [
  { href: "https://github.com/PuditC", icon: AiFillGithub, label: "GitHub" },
  { href: "https://gitlab.com/oampudit", icon: AiFillGitlab, label: "GitLab" },
  { href: "https://www.linkedin.com/in/puditc", icon: FaLinkedinIn, label: "LinkedIn" },
  { href: "mailto:pudit.chok@gmail.com", icon: HiOutlineMail, label: "Email" },
];

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-pro">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="footer-left">
            <span className="footer-name">Pudit Chokmeesuk</span>
            <span className="footer-sub">Full-stack engineer · Bangkok</span>
          </Col>
          <Col md={6} className="footer-right">
            <ul className="footer-links">
              {LINKS.map(({ href, icon: Icon, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
            <span className="footer-copy">© {year}</span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
