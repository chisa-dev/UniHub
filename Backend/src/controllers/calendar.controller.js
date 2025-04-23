const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const getEvents = async (req, res) => {
  const { startDate, endDate, type } = req.query;
  
  try {
    let whereClause = `WHERE (e.user_id = ? OR e.id IN (
      SELECT event_id FROM event_participants WHERE user_id = ?
    ))`;
    const replacements = [req.user.id, req.user.id];

    if (startDate) {
      whereClause += ' AND e.start_time >= ?';
      replacements.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND e.end_time <= ?';
      replacements.push(endDate);
    }
    if (type) {
      whereClause += ' AND e.type = ?';
      replacements.push(type);
    }

    const [events] = await sequelize.query(
      `SELECT e.*, u.username as creator_name,
              GROUP_CONCAT(DISTINCT p.username) as participant_names,
              COUNT(DISTINCT ep.user_id) as participant_count
       FROM calendar_events e
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN event_participants ep ON e.id = ep.event_id
       LEFT JOIN users p ON ep.user_id = p.id
       ${whereClause}
       GROUP BY e.id
       ORDER BY e.start_time ASC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Parse participant names from GROUP_CONCAT
    const formattedEvents = events.map(event => ({
      ...event,
      participant_names: event.participant_names ? event.participant_names.split(',') : []
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

const getEvent = async (req, res) => {
  try {
    const [event] = await sequelize.query(
      `SELECT e.*, u.username as creator_name,
              GROUP_CONCAT(DISTINCT p.username) as participant_names
       FROM calendar_events e
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN event_participants ep ON e.id = ep.event_id
       LEFT JOIN users p ON ep.user_id = p.id
       WHERE e.id = ? AND (e.user_id = ? OR ep.user_id = ?)
       GROUP BY e.id`,
      {
        replacements: [req.params.id, req.user.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Parse participant names
    event.participant_names = event.participant_names ? event.participant_names.split(',') : [];

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
};

const createEvent = async (req, res) => {
  const { 
    title, description, startTime, endTime, type,
    location, isOnline, meetingLink, participants = []
  } = req.body;

  try {
    const eventId = uuidv4();
    
    // Create event
    await sequelize.query(
      `INSERT INTO calendar_events (
        id, title, description, start_time, end_time,
        type, location, is_online, meeting_link, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          eventId, title, description, startTime, endTime,
          type, location, isOnline, meetingLink, req.user.id
        ],
      }
    );

    // Add participants
    if (participants.length > 0) {
      const participantValues = participants.map(userId => 
        `('${uuidv4()}', '${eventId}', '${userId}')`
      ).join(',');

      await sequelize.query(
        `INSERT INTO event_participants (id, event_id, user_id) VALUES ${participantValues}`
      );
    }

    res.status(201).json({
      message: 'Event created successfully',
      eventId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

const updateEvent = async (req, res) => {
  const { 
    title, description, startTime, endTime,
    location, isOnline, meetingLink, participants
  } = req.body;

  try {
    // Check if user owns the event
    const [event] = await sequelize.query(
      'SELECT * FROM calendar_events WHERE id = ? AND user_id = ?',
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!event) {
      return res.status(404).json({ 
        message: 'Event not found or you do not have permission to update it' 
      });
    }

    // Update event details
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (startTime !== undefined) {
      updates.push('start_time = ?');
      values.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push('end_time = ?');
      values.push(endTime);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (isOnline !== undefined) {
      updates.push('is_online = ?');
      values.push(isOnline);
    }
    if (meetingLink !== undefined) {
      updates.push('meeting_link = ?');
      values.push(meetingLink);
    }

    if (updates.length > 0) {
      await sequelize.query(
        `UPDATE calendar_events 
         SET ${updates.join(', ')} 
         WHERE id = ?`,
        {
          replacements: [...values, req.params.id],
        }
      );
    }

    // Update participants if provided
    if (participants !== undefined) {
      // Remove existing participants
      await sequelize.query(
        'DELETE FROM event_participants WHERE event_id = ?',
        {
          replacements: [req.params.id],
        }
      );

      // Add new participants
      if (participants.length > 0) {
        const participantValues = participants.map(userId => 
          `('${uuidv4()}', '${req.params.id}', '${userId}')`
        ).join(',');

        await sequelize.query(
          `INSERT INTO event_participants (id, event_id, user_id) VALUES ${participantValues}`
        );
      }
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const [result] = await sequelize.query(
      'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
      {
        replacements: [req.params.id, req.user.id],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Event not found or you do not have permission to delete it' 
      });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
}; 