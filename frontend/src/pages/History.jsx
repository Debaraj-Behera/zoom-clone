import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();

        setMeetings(history);
      } catch (error) {
        console.log("Error is fetching history", error);
        throw error;
      }
    };
    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day} / ${month} / ${year}`;
  };
  return (
    <div>
      <IconButton onClick={() => routeTo("/home")}>
        <HomeIcon />
      </IconButton>
      {meetings?.map((e, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Typography
              gutterBottom
              sx={{ color: "text.secondary", fontSize: 14 }}
            >
              Code: {e.meetingCode}
            </Typography>

            <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
              Date: {e.date ? formatDate(e.date) : "N/A"}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
