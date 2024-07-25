import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import {
  Box,
  Modal,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const localizer = momentLocalizer(moment);

const App = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showActiveEventsModal, setShowActiveEventsModal] = useState(false);
  const [showMultipleEventsModal, setShowMultipleEventsModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [selectEvent, setSelectEvent] = useState(null);
  const [uniqueEvents, setUniqueEvents] = useState([]);
  const [multipleEvents, setMultipleEvents] = useState([]);
  const [showMoreDate, setShowMoreDate] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/events`);
      setEvents(response.data);
      const uniqueEventsList = getUniqueEvents(response.data);
      setUniqueEvents(uniqueEventsList);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const handleSelectSlot = () => {
    setShowModal(true);
    setStartDate(null);
    setEndDate(null);
    setSelectEvent(null);
  };

  const handleSelectedEvent = (event) => {
    const eventsOnSameDate = events.filter((e) =>
      moment(e.start).isSame(event.start, "day")
    );
    if (eventsOnSameDate.length > 2) {
      setMultipleEvents(eventsOnSameDate);
      setShowMultipleEventsModal(true);
    } else {
      setShowModal(true);
      setSelectEvent(event);
      setEventTitle(event.title);
      setStartDate(moment(event.start));
      setEndDate(moment(event.end));
    }
  };

  const splitEventIntoDays = (event) => {
    const { title, start, end } = event;
    const events = [];

    let current = moment(start).startOf("day");
    const endDate = moment(end).startOf("day");

    while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
      const eventStart = current.clone().startOf("day").toDate();
      const eventEnd = current.clone().endOf("day").toDate();

      if (current.isSame(moment(start).startOf("day"))) {
        events.push({
          title,
          start: start,
          end: eventEnd,
        });
      } else if (current.isSame(endDate)) {
        events.push({
          title,
          start: eventStart,
          end: end,
        });
      } else {
        events.push({
          title,
          start: eventStart,
          end: eventEnd,
        });
      }

      current.add(1, "days");
    }

    return events;
  };

  const saveEvent = async () => {
    if (eventTitle && startDate && endDate) {
      if (startDate.isAfter(endDate)) {
        alert("End date cannot be before the start date.");
        return;
      }
      const newEvent = {
        title: eventTitle,
        start: startDate.toDate(),
        end: endDate.toDate(),
      };
      const splitEvents = splitEventIntoDays(newEvent);

      try {
        if (selectEvent) {
          await axios.put(`${import.meta.env.VITE_API_URL}/events/${selectEvent.id}`, splitEvents[0]);
        } else {
          await axios.post(`${import.meta.env.VITE_API_URL}/events`, splitEvents);
        }
        fetchEvents();
      } catch (error) {
        console.error("Error saving event", error);
      }
      setShowModal(false);
      setEventTitle("");
      setStartDate(null);
      setEndDate(null);
      setSelectEvent(null);
    }
  };

  const deleteEvent = async () => {
    if (selectEvent) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/events/${selectEvent.id}`);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event", error);
      }
      setShowModal(false);
      setEventTitle("");
      setStartDate(null);
      setEndDate(null);
      setSelectEvent(null);
    }
  };

  const getUniqueEvents = (events) => {
    const unique = [];
    const map = new Map();
    events.forEach((item) => {
      if (!map.has(item.title)) {
        map.set(item.title, true);
        unique.push({
          title: item.title,
          start: item.start,
          end: item.end,
        });
      }
    });

    const uniqueWithMinMax = unique.map((event) => {
      const filteredEvents = events.filter((e) => e.title === event.title);
      const minStart = moment.min(filteredEvents.map((e) => moment(e.start)));
      const maxEnd = moment.max(filteredEvents.map((e) => moment(e.end)));
      return {
        ...event,
        minStart: minStart.toDate(),
        maxEnd: maxEnd.toDate(),
      };
    });

    return uniqueWithMinMax;
  };

  const handleDrillDown = async (date, view) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/events?date=${moment(date).format("YYYY-MM-DD")}`
      );
      setShowMoreDate(date);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events for drill down", error);
    }
  };

  return (
    <>
    <Box sx={{height: "60px", backgroundColor: "lightblue", fontSize: "30px", display: "flex", alignItems: "center", paddingLeft: "20px"}}>
     <b>NIQ Leave Portal</b>
    </Box>
    <div style={{ height: "500px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ margin: "50px" }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectedEvent}
        onDrillDown={handleDrillDown}
      />

      {showModal && (
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEventTitle("");
            setStartDate(null);
            setEndDate(null);
            setSelectEvent(null);
          }}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              {selectEvent ? "Edit Leave" : "Apply Leave"}
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              label={selectEvent ? "Edit Name" : "Employee Name"}
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
            />
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  disablePast
                  renderInput={(params) => (
                    <TextField fullWidth margin="normal" {...params} />
                  )}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  disablePast
                  renderInput={(params) => (
                    <TextField fullWidth margin="normal" {...params} />
                  )}
                />
              </Box>
            </LocalizationProvider>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              {selectEvent && (
                <Button variant="contained" color="error" onClick={deleteEvent}>
                  Delete Leave
                </Button>
              )}
              <Button variant="contained" onClick={saveEvent}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      <Modal
        open={showActiveEventsModal}
        onClose={() => setShowActiveEventsModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Current leave active on {showMoreDate ? moment(showMoreDate).format("LL") : ""}
          </Typography>
          {uniqueEvents
            .filter((event) => moment(event.minStart).isSameOrBefore(showMoreDate) && moment(event.maxEnd).isSameOrAfter(showMoreDate))
            .map((event) => (
              <Box
                key={event.title}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography>{event.title}</Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setEventTitle(event.title);
                    setStartDate(moment(event.minStart));
                    setEndDate(moment(event.maxEnd));
                    setSelectEvent(event);
                    setShowModal(true);
                  }}
                >
                  Edit
                </Button>
              </Box>
            ))}
        </Box>
      </Modal>

      <Modal
        open={showMultipleEventsModal}
        onClose={() => setShowMultipleEventsModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
          Employee on leave on{" "}
                    {moment(multipleEvents[0]?.start).format("DD-MMMM")}
          </Typography>
          {multipleEvents.map((event, index) => (
            <Box
              key={event.title + event.start}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Typography>{`${index+1}. ${event.title}`}</Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setEventTitle(event.title);
                  setStartDate(moment(event.start));
                  setEndDate(moment(event.end));
                  setSelectEvent(event);
                  setShowModal(true);
                  setShowMultipleEventsModal(false)
                }}
              >
                Edit
              </Button>
            </Box>
          ))}
        </Box>
      </Modal>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
      </Box>
    </div>
    </>
  );
};

export default App;
