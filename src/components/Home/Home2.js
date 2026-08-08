import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/profile.png";
import Tilt from "react-parallax-tilt";
import {
  AiFillGithub,
  AiFillGitlab,
  AiFillFacebook,
  AiFillInstagram,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";

function Home2() {
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={9} className="home-about-description">
            <h1 style={{ fontSize: "2.6em" }}>
              LET ME <span className="blue"> INTRODUCE </span> MYSELF
            </h1>
            <p className="home-about-body">
              My journey in programming has been deeply enriching and constantly evolving. I believe in lifelong learning and the power of technology. 🚀
              <br />
              <br />I have developed a strong proficiency in
              <i>
                <b className="blue"> C#, Dart, and TypeScript. </b>
              </i>
              <br />
              <br />
              In terms of frameworks and libraries, I am well-versed in
              <i>
                <b className="blue">.NET Framework, Angular, and Flutter. </b>
              </i>
              My expertise also extends to robust
              <b className="blue">Web Technologies</b> like HTML and CSS, underpinning modern web development.
              <br />
              <br />
              I possess significant experience in database management, particularly with
              <i>
                <b className="blue">Oracle Database (PL/SQL).</b>
              </i>
              <br />
              <br />
              My version control skills are honed on platforms like
              <b className="blue">Git, GitHub, and GitLab,</b> ensuring efficient and collaborative coding environments.
              <br />
              <br />
              Additionally, I have practical knowledge of
              <i>
                <b className="blue">Unreal Engine 4</b>
              </i> and have implemented
              <b className="blue">Firebase</b> in creating scalable and robust applications.
            </p>
          </Col>
          <Col md={3} className="myAvtar">
            <Tilt>
              <img src={myImg} className="img-fluid" alt="avatar" />
            </Tilt>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="home-about-social">
            <h1>FIND ME ON</h1>
            {/* <p>
              Feel free to <span className="blue">connect </span>with me
            </p> */}
            <ul className="home-about-social-links">
              <li className="social-icons">
                <a
                  href="https://github.com/PuditC"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiFillGithub />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://gitlab.com/oampudit"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiFillGitlab />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.linkedin.com/in/puditc"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <FaLinkedinIn />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.facebook.com/oam543"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour  home-social-icons"
                >
                  <AiFillFacebook />
                </a>
              </li>
              <li className="social-icons">
                <a
                  href="https://www.instagram.com/oam_pudit"
                  target="_blank"
                  rel="noreferrer"
                  className="icon-colour home-social-icons"
                >
                  <AiFillInstagram />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default Home2;
