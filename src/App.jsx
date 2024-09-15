import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import { Box, Modal, Typography, Button, TextField, CircularProgress } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import CloseIcon from "@mui/icons-material/Close";

const localizer = momentLocalizer(moment);

const App = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showActiveEventsModal, setShowActiveEventsModal] = useState(false);
  const [showMultipleEventsModal, setShowMultipleEventsModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [leaveReason, setLeaveReason] = useState(""); // New state for leave reason
  const [selectEvent, setSelectEvent] = useState(null);
  const [uniqueEvents, setUniqueEvents] = useState([]);
  const [multipleEvents, setMultipleEvents] = useState([]);
  const [showMoreDate, setShowMoreDate] = useState(null);
  const [loading, setLoading] = useState(false); // New state for loading
  const [deleteLoading, setDeleteLoading] = useState(false); // New state for loading

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/events`
      );
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
    setLeaveReason(""); // Reset leave reason
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
      setLeaveReason(event.reason || ""); // Set leave reason if available
    }
  };

  const splitEventIntoDays = (event) => {
    const { title, start, end, reason } = event;
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
          reason, // Include reason
        });
      } else if (current.isSame(endDate)) {
        events.push({
          title,
          start: eventStart,
          end: end,
          reason, // Include reason
        });
      } else {
        events.push({
          title,
          start: eventStart,
          end: eventEnd,
          reason, // Include reason
        });
      }

      current.add(1, "days");
    }

    return events;
  };

  const saveEvent = async () => {
    if (eventTitle && startDate && endDate && leaveReason) {
      if (startDate.isAfter(endDate)) {
        alert("End date cannot be before the start date.");
        return;
      }
      const newEvent = {
        title: eventTitle,
        start: startDate.toDate(),
        end: endDate.toDate(),
        reason: leaveReason, // Include reason
      };
      const splitEvents = splitEventIntoDays(newEvent);
      setLoading(true);
      try {
        if (selectEvent) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/events/${selectEvent.id}`,
            splitEvents[0]
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/events`,
            splitEvents
          );
        }
        fetchEvents();
      } catch (error) {
        console.error("Error saving event", error);
      }
      setLoading(false);
      setShowModal(false);
      setEventTitle("");
      setStartDate(null);
      setEndDate(null);
      setLeaveReason(""); // Reset leave reason
      setSelectEvent(null);
    }
  };

  const deleteEvent = async () => {
    if (selectEvent) {
      setDeleteLoading(true);
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/events/${selectEvent.id}`
        );
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event", error);
      }
      setDeleteLoading(false);
      setShowModal(false);
      setEventTitle("");
      setStartDate(null);
      setEndDate(null);
      setLeaveReason(""); // Reset leave reason
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
          reason: item.reason, // Include reason
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
        `${import.meta.env.VITE_API_URL}/events?date=${moment(date).format(
          "YYYY-MM-DD"
        )}`
      );
      setShowMoreDate(date);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events for drill down", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          height: "60px",
          backgroundColor: "black",
          color: "white",
          fontSize: "30px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "20px",
        }}
      >
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
              setLeaveReason(""); // Reset leave reason
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
                padding: "30px",
                borderRadius: "10px",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  {selectEvent ? "Edit Leave" : "Apply Leave"}
                </Typography>
                <CloseIcon
                  onClick={() => {
                    setShowModal(false);
                    setEventTitle("");
                    setStartDate(null);
                    setEndDate(null);
                    setLeaveReason(""); // Reset leave reason
                    setSelectEvent(null);
                  }}
                />
              </Box>
              <TextField
                fullWidth
                margin="normal"
                label={selectEvent ? "Edit Name" : "Employee Name"}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Leave Reason"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
              />
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => (
                      <TextField fullWidth margin="normal" {...params} />
                    )}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => (
                      <TextField fullWidth margin="normal" {...params} />
                    )}
                  />
                </Box>
              </LocalizationProvider>
              <Box
                sx={{ display: "flex", justifyContent: selectEvent ? "space-between" : "center", mt: 2 }}
              >
                {selectEvent ? <Button variant="contained" color="error" onClick={deleteEvent} disabled={deleteLoading}>
                  {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
                </Button> : null}
                <Button variant="contained" onClick={saveEvent} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : "Save"}
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
              padding: "30px",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Current leave active on{" "}
                {showMoreDate ? moment(showMoreDate).format("LL") : ""}
              </Typography>
              <CloseIcon
                onClick={() => {
                  setShowActiveEventsModal(false);
                  setEventTitle("");
                  setStartDate(null);
                  setEndDate(null);
                  setLeaveReason(""); // Reset leave reason
                  setSelectEvent(null);
                }}
              />
            </Box>
            {uniqueEvents
              .filter(
                (event) =>
                  moment(event.minStart).isSameOrBefore(showMoreDate) &&
                  moment(event.maxEnd).isSameOrAfter(showMoreDate)
              )
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
                      setLeaveReason(event.reason || ""); // Set leave reason if available
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
              padding: "30px",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Employee on leave on{" "}
                {moment(multipleEvents[0]?.start).format("DD-MMMM")}
              </Typography>
              <CloseIcon
                onClick={() => {
                  setShowMultipleEventsModal(false);
                  setEventTitle("");
                  setStartDate(null);
                  setEndDate(null);
                  setLeaveReason(""); // Reset leave reason
                  setSelectEvent(null);
                }}
              />
            </Box>
            <Box
              sx={{
                height: "250px",
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              {multipleEvents.map((event, index) => (
                <Box
                  key={event.title + event.start}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                    mr: 2,
                  }}
                >
                  <Typography>{`${index + 1}. ${event.title}`}</Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      sx={{ height: "30px", width: "50px", fontSize: "12px" }}
                      variant="contained"
                      onClick={() => {
                        setEventTitle(event.title);
                        setStartDate(moment(event.start));
                        setEndDate(moment(event.end));
                        setLeaveReason(event.reason || ""); // Set leave reason if available
                        setSelectEvent(event);
                        setShowModal(true);
                        setShowMultipleEventsModal(false);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      sx={{ height: "30px", width: "50px", fontSize: "12px" }}
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        setDeleteLoading(true);
                        try {
                          await axios.delete(
                            `${import.meta.env.VITE_API_URL}/events/${event.id}`
                          );
                          fetchEvents();
                          setShowMultipleEventsModal(false);
                        } catch (error) {
                          console.error("Error deleting event", error);
                        }
                        setDeleteLoading(false);
                      }}
                      disabled={loading}
                    >
                      {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default App;