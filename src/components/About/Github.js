import React from "react";
import GitHubCalendar from "react-github-calendar";
import { Row } from "react-bootstrap";

function Github() {
  // Heading is provided by the parent section in About.js ("Days I code"),
  // so this component only renders the calendar itself — no duplicate title.
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
      <GitHubCalendar
        username="PuditC"
        blockSize={15}
        blockMargin={5}
        color="#818cf8"
        fontSize={16}
      />
    </Row>
  );
}

export default Github;
