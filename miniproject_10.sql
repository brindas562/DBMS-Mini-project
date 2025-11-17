CREATE DATABASE events;
USE events;

-- DDL (same as before, no changes needed)

-- User table
CREATE TABLE Users (
    userId INT PRIMARY KEY,
    userName VARCHAR(25) NOT NULL,
    userEmail VARCHAR(50) UNIQUE NOT NULL,
    userPhone VARCHAR(15),
    userRole VARCHAR(20) NOT NULL,
    userPassword VARCHAR(100) NOT NULL
);

-- Event table
CREATE TABLE Event (
    eventId INT PRIMARY KEY,
    title VARCHAR(25) NOT NULL,
    category VARCHAR(50) NOT NULL,
    eventDescription VARCHAR(500),
    startDate DATETIME NOT NULL,
    duration INT NOT NULL,
    organizerId INT NOT NULL,
    FOREIGN KEY (organizerId) REFERENCES Users(userId)
);

-- Venue table
CREATE TABLE Venue(
    venueId INT PRIMARY KEY,
    venueName VARCHAR(25) NOT NULL,
    venueAddress VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    contactInfo VARCHAR(15) NOT NULL
);

-- EventVenue
CREATE TABLE EventVenue (
    eventId INT,
    venueId INT,
    PRIMARY KEY (eventId, venueId),
    FOREIGN KEY (eventId) REFERENCES Event(eventId),
    FOREIGN KEY (venueId) REFERENCES Venue(venueId)
);

-- Ticket table
CREATE TABLE Ticket (
    ticketId INT PRIMARY KEY,
    eventId INT NOT NULL,
    tCategory VARCHAR(50) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    availability INT NOT NULL,
    FOREIGN KEY (eventId) REFERENCES Event(eventId)
);

-- Booking table
CREATE TABLE Booking (
    bookingId INT PRIMARY KEY,
    userId INT NOT NULL,
    ticketId INT NOT NULL,
    bookingDate DATE NOT NULL,
    bookingStatus VARCHAR(20) NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (ticketId) REFERENCES Ticket(ticketId)
);

-- Payment table
CREATE TABLE Payment(
    paymentId INT PRIMARY KEY,
    bookingId INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paymentDate DATE NOT NULL,
    method VARCHAR(20) NOT NULL,
    paymentStatus VARCHAR(20) NOT NULL,
    FOREIGN KEY (bookingId) REFERENCES Booking(bookingId)
);

-- Sponsor table
CREATE TABLE Sponsor (
    sponsorId INT PRIMARY KEY,
    sponsorName VARCHAR(35) NOT NULL,
    sponsorContactInfo VARCHAR(15) NOT NULL,
    contribution DECIMAL(12,2) NOT NULL
);

-- EventSponsor
CREATE TABLE EventSponsor (
    eventId INT,
    sponsorId INT,
    PRIMARY KEY (eventId, sponsorId),
    FOREIGN KEY (eventId) REFERENCES Event(eventId),
    FOREIGN KEY (sponsorId) REFERENCES Sponsor(sponsorId)
);

-- Staff table
CREATE TABLE Staff (
    staffId INT PRIMARY KEY,
    staffName VARCHAR(35) NOT NULL,
    staffRole VARCHAR(50) NOT NULL,
    staffContactInfo VARCHAR(15) NOT NULL
);

-- EventStaff
CREATE TABLE EventStaff (
    eventId INT,
    staffId INT,
    assignment VARCHAR(50) NOT NULL,
    PRIMARY KEY (eventId, staffId),
    FOREIGN KEY (eventId) REFERENCES Event(eventId),
    FOREIGN KEY (staffId) REFERENCES Staff(staffId)
);

-- Feedback
CREATE TABLE Feedback (
    userId INT,
    eventId INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments VARCHAR(250),
    PRIMARY KEY (userId, eventId),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (eventId) REFERENCES Event(eventId)
);


-- DML (expanded)

-- Users (10)
INSERT INTO Users VALUES
(1, 'Alice', 'alice@mail.com', '9876543210', 'Customer', 'pass123'),
(2, 'Bob', 'bob@mail.com', '9876500000', 'Organizer', 'pass456'),
(3, 'David', 'david@mail.com', '9876000002', 'Customer', 'dav123'),
(4, 'Eva', 'eva@mail.com', '9876000003', 'Organizer', 'eva456'),
(5, 'Frank', 'frank@mail.com', '9876000004', 'Customer', 'frank789'),
(6, 'Sophia', 'sophia@mail.com', '9876000005', 'Customer', 'sop111'),
(7, 'Liam', 'liam@mail.com', '9876000006', 'Customer', 'liam222'),
(8, 'Olivia', 'olivia@mail.com', '9876000007', 'Organizer', 'oli333'),
(9, 'Noah', 'noah@mail.com', '9876000008', 'Customer', 'noah444'),
(10, 'Mia', 'mia@mail.com', '9876000009', 'Customer', 'mia555');

-- Events (10)
INSERT INTO Event VALUES
(101, 'MusicFest', 'Concert', 'Annual Music Festival', '2025-11-10 18:00:00', 3, 2),
(102, 'TechSummit', 'Conference', 'Technology Summit 2025', '2025-12-05 10:00:00', 2, 4),
(103, 'ArtExpo', 'Exhibition', 'Annual Art Exhibition', '2025-11-20 09:30:00', 1, 2),
(104, 'FoodCarnival', 'Festival', 'Street food festival', '2025-10-15 17:00:00', 2, 8),
(105, 'StartupPitch', 'Business', 'Startup pitch event', '2025-12-10 09:00:00', 1, 2),
(106, 'FilmScreening', 'Movie', 'Classic movie marathon', '2025-11-25 19:00:00', 1, 4),
(107, 'BookFair', 'Exhibition', 'International Book Fair', '2025-12-01 10:00:00', 5, 8),
(108, 'DanceShow', 'Performance', 'Contemporary Dance Night', '2025-10-28 18:30:00', 1, 2),
(109, 'Hackathon', 'Competition', '24-hour coding event', '2025-11-12 09:00:00', 2, 4),
(110, 'CharityConcert', 'Fundraiser', 'Concert for a cause', '2025-11-30 18:00:00', 1, 8);

-- Venues (10)
INSERT INTO Venue VALUES
(201, 'City Hall', 'Main Street, Downtown', 5000, '9876512345'),
(202, 'Expo Center', 'Tech Park Road', 3000, '9876111222'),
(203, 'Art Gallery', 'Uptown Street', 800, '9876333444'),
(204, 'Open Grounds', 'Central Park', 10000, '9876222111'),
(205, 'Theatre House', 'Cultural Street', 1200, '9876444555'),
(206, 'Hotel Plaza', 'Airport Road', 1500, '9876555666'),
(207, 'Convention Center', 'Highway Road', 4000, '9876777888'),
(208, 'Community Hall', 'Suburb Lane', 700, '9876999000'),
(209, 'Auditorium', 'College Campus', 2500, '9876888999'),
(210, 'Sports Arena', 'North Side Avenue', 8000, '9876111000');

-- EventVenue (10)
INSERT INTO EventVenue VALUES
(101,201),(102,202),(103,203),(104,204),(105,205),
(106,206),(107,207),(108,208),(109,209),(110,210);

-- Tickets (12+)
INSERT INTO Ticket VALUES
(301,101,'VIP',2000.00,100),
(302,101,'General',500.00,500),
(303,102,'Standard',1000.00,200),
(304,102,'Premium',2500.00,50),
(305,103,'General',300.00,400),
(306,103,'VIP',1000.00,30),
(307,104,'General',200.00,600),
(308,104,'VIP',800.00,50),
(309,105,'Standard',500.00,100),
(310,106,'General',150.00,300),
(311,107,'General',100.00,800),
(312,108,'VIP',1200.00,40),
(313,109,'Team',0.00,50),
(314,110,'General',700.00,200);

-- Bookings (10)
INSERT INTO Booking VALUES
(401,1,301,'2025-11-01','Confirmed'),
(402,3,303,'2025-11-15','Confirmed'),
(403,5,305,'2025-11-16','Confirmed'),
(404,6,304,'2025-11-20','Pending'),
(405,7,302,'2025-10-25','Confirmed'),
(406,8,307,'2025-10-10','Confirmed'),
(407,9,310,'2025-11-05','Confirmed'),
(408,10,311,'2025-12-02','Pending'),
(409,1,308,'2025-10-14','Confirmed'),
(410,2,314,'2025-11-30','Confirmed');

-- Payments (10)
INSERT INTO Payment VALUES
(501,401,2000.00,'2025-11-01','CreditCard','Successful'),
(502,402,1000.00,'2025-11-15','UPI','Successful'),
(503,403,300.00,'2025-11-16','Cash','Successful'),
(504,404,2500.00,'2025-11-20','CreditCard','Pending'),
(505,405,500.00,'2025-10-25','UPI','Successful'),
(506,406,200.00,'2025-10-10','Cash','Successful'),
(507,407,150.00,'2025-11-05','UPI','Successful'),
(508,408,100.00,'2025-12-02','CreditCard','Pending'),
(509,409,800.00,'2025-10-14','DebitCard','Successful'),
(510,410,700.00,'2025-11-30','UPI','Successful');

-- Sponsors (10)
INSERT INTO Sponsor VALUES
(601,'XYZ Corp','9988776655',50000.00),
(602,'ABC Tech','9876444555',75000.00),
(603,'ArtWorld','9876555666',25000.00),
(604,'Foodies','9876111223',40000.00),
(605,'StartupHub','9876000099',60000.00),
(606,'FilmLovers','9876000088',20000.00),
(607,'ReadersClub','9876000077',30000.00),
(608,'DanceWorld','9876000066',15000.00),
(609,'CodeMasters','9876000055',100000.00),
(610,'CharityOrg','9876000044',45000.00);

-- EventSponsors (10)
INSERT INTO EventSponsor VALUES
(101,601),(102,602),(103,603),(104,604),(105,605),
(106,606),(107,607),(108,608),(109,609),(110,610);

-- Staff (10)
INSERT INTO Staff VALUES
(701,'Charlie','Technician','9876000001'),
(702,'Grace','Coordinator','9876000005'),
(703,'Henry','Security','9876000006'),
(704,'Irene','Artist Manager','9876000007'),
(705,'John','Lighting','9876000010'),
(706,'Katy','Sound Engineer','9876000011'),
(707,'Leo','Volunteer','9876000012'),
(708,'Mona','Event Planner','9876000013'),
(709,'Nick','Host','9876000014'),
(710,'Oscar','Stage Manager','9876000015');

-- EventStaff (10)
INSERT INTO EventStaff VALUES
(101,701,'Sound Setup'),
(102,702,'Session Coordination'),
(102,703,'Hall Security'),
(103,704,'Exhibition Support'),
(104,705,'Light Setup'),
(105,706,'Audio Setup'),
(106,707,'Ticket Check'),
(107,708,'Stall Arrangement'),
(108,709,'Stage Host'),
(109,710,'Stage Management');

-- Feedback (10)
INSERT INTO Feedback VALUES
(1,101,5,'Amazing event!'),
(3,102,4,'Very Informative'),
(5,103,5,'Beautiful artwork'),
(6,104,3,'Good but crowded'),
(7,105,4,'Loved the pitches'),
(8,106,5,'Great films shown'),
(9,107,4,'Huge variety of books'),
(10,108,5,'Excellent performances'),
(1,109,5,'Fun coding event!'),
(2,110,4,'Great concert for charity');

SELECT * FROM Users;
SELECT * FROM Event;
SELECT * FROM Venue;
SELECT * FROM EventVenue;
SELECT * FROM Ticket;
SELECT * FROM Booking;
SELECT * FROM Payment;
SELECT * FROM Sponsor;
SELECT * FROM EventSponsor;
SELECT * FROM Staff;
SELECT * FROM EventStaff;
SELECT * FROM Feedback;

-- Updates (DML - UPDATE)

UPDATE Booking SET bookingStatus = 'Confirmed' WHERE bookingId = 404;
UPDATE Ticket SET availability = availability - 1 WHERE ticketId = 301;
UPDATE Event SET eventDescription = 'Annual Music Festival with international artists' WHERE eventId = 101;
UPDATE Sponsor SET contribution = contribution + 10000 WHERE sponsorId = 601;

-- Deletes (DML - DELETE)

-- Example: Remove a feedback entry
DELETE FROM Feedback WHERE userId = 5 AND eventId = 103;

-- Selects (DML - SELECT)

-- 1. List all events with derived endDate
SELECT eventId, title, startDate, duration,
       DATE_ADD(startDate, INTERVAL duration DAY) AS endDate
FROM Event;

-- 2. Show all confirmed bookings with user and event details
SELECT b.bookingId, u.userName, e.title, b.bookingStatus
FROM Booking b
JOIN Users u ON b.userId = u.userId
JOIN Ticket t ON b.ticketId = t.ticketId
JOIN Event e ON t.eventId = e.eventId
WHERE b.bookingStatus = 'Confirmed';

-- 3. Total sponsorship per event
SELECT e.title, SUM(s.contribution) AS total_contribution
FROM Event e
JOIN EventSponsor es ON e.eventId = es.eventId
JOIN Sponsor s ON es.sponsorId = s.sponsorId
GROUP BY e.title;

-- 4. Feedback summary (average rating per event)
SELECT e.title, AVG(f.rating) AS avg_rating
FROM Feedback f
JOIN Event e ON f.eventId = e.eventId
GROUP BY e.title;

-- Triggers

-- Reduce ticket availability after each confirmed booking
DELIMITER $$
CREATE TRIGGER reduce_ticket_availability
AFTER INSERT ON Booking
FOR EACH ROW
BEGIN
    UPDATE Ticket
    SET availability = availability - 1
    WHERE ticketId = NEW.ticketId;
END$$
DELIMITER ;

-- Automatically mark payment as "Successful" if amount > 0
DELIMITER $$
CREATE TRIGGER set_payment_status
BEFORE INSERT ON Payment
FOR EACH ROW
BEGIN
    IF NEW.amount > 0 THEN
        SET NEW.paymentStatus = 'Successful';
    ELSE
        SET NEW.paymentStatus = 'Failed';
    END IF;
END$$
DELIMITER ;

-- Log changes in booking status (audit log)
CREATE TABLE BookingLog (
    logId INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT,
    oldStatus VARCHAR(20),
    newStatus VARCHAR(20),
    changeTime DATETIME DEFAULT NOW()
);

DELIMITER $$
CREATE TRIGGER log_booking_status_change
AFTER UPDATE ON Booking
FOR EACH ROW
BEGIN
    IF OLD.bookingStatus <> NEW.bookingStatus THEN
        INSERT INTO BookingLog (bookingId, oldStatus, newStatus)
        VALUES (NEW.bookingId, OLD.bookingStatus, NEW.bookingStatus);
    END IF;
END$$
DELIMITER ;

-- Stored Procedures

-- Book a ticket (user → ticket → booking + payment)
-- DELIMITER $$
-- CREATE PROCEDURE BookTicket(
--     IN p_userId INT,
--     IN p_ticketId INT,
--     IN p_amount DECIMAL(12,2),
--     IN p_method VARCHAR(20)
-- )
-- BEGIN
--     DECLARE newBookingId INT;
--     DECLARE newPaymentId INT;

--     -- Insert booking
--     INSERT INTO Booking (bookingId, userId, ticketId, bookingDate, bookingStatus)
--     VALUES ((SELECT IFNULL(MAX(bookingId), 400) + 1 FROM Booking),
--             p_userId, p_ticketId, CURDATE(), 'Confirmed');
--             
--     SET newBookingId = LAST_INSERT_ID();

--     -- Insert payment
--     INSERT INTO Payment (paymentId, bookingId, amount, paymentDate, method, paymentStatus)
--     VALUES ((SELECT IFNULL(MAX(paymentId), 500) + 1 FROM Payment),
--             newBookingId, p_amount, CURDATE(), p_method, 'Successful');
-- END$$
-- DELIMITER ;
-- CALL BookTicket(1, 301, 2000.00, 'UPI');

-- Show event details by category
DELIMITER $$
CREATE PROCEDURE GetEventsByCategory(IN p_category VARCHAR(50))
BEGIN
    SELECT e.eventId, e.title, e.startDate, v.venueName
    FROM Event e
    JOIN EventVenue ev ON e.eventId = ev.eventId
    JOIN Venue v ON ev.venueId = v.venueId
    WHERE e.category = p_category;
END$$
DELIMITER ;
CALL GetEventsByCategory('Conference');

-- Show total revenue and ticket count for a specific event
DELIMITER $$
CREATE PROCEDURE EventRevenueSummary(IN p_eventId INT)
BEGIN
    SELECT 
        e.title,
        COUNT(b.bookingId) AS total_tickets_sold,
        SUM(p.amount) AS total_revenue
    FROM Event e
    JOIN Ticket t ON e.eventId = t.eventId
    JOIN Booking b ON t.ticketId = b.ticketId
    JOIN Payment p ON b.bookingId = p.bookingId
    WHERE e.eventId = p_eventId
      AND p.paymentStatus = 'Successful'
    GROUP BY e.eventId, e.title;
END$$
DELIMITER ;
CALL EventRevenueSummary(101);

-- User defined functions

-- Get average event rating by Event ID
DELIMITER $$
CREATE FUNCTION GetAverageRating(p_eventId INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
    DECLARE avgRating DECIMAL(3,2);
    SELECT IFNULL(AVG(rating), 0)
    INTO avgRating
    FROM Feedback
    WHERE eventId = p_eventId;
    RETURN avgRating;
END$$
DELIMITER ;
SELECT title, GetAverageRating(eventId) AS avg_rating FROM Event;

-- Calculate event end date
DELIMITER $$
CREATE FUNCTION GetEventEndDate(startDate DATETIME, duration INT)
RETURNS DATETIME
DETERMINISTIC
RETURN DATE_ADD(startDate, INTERVAL duration HOUR);
$$
DELIMITER ;
SELECT title, GetEventEndDate(startDate, duration) AS endDate FROM Event;

-- Get total payment made by a user
DELIMITER $$
CREATE FUNCTION GetTotalPaid(userId INT)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(12,2);
    SELECT IFNULL(SUM(p.amount), 0)
    INTO total
    FROM Payment p
    JOIN Booking b ON p.bookingId = b.bookingId
    WHERE b.userId = userId AND p.paymentStatus = 'Successful';
    RETURN total;
END$$
DELIMITER ;
SELECT userName, GetTotalPaid(userId) AS total_paid FROM Users;

-- view
-- High Rated Events Overview
CREATE VIEW HighRatedEvents AS
SELECT 
    e.eventId,
    e.title,
    ROUND(AVG(f.rating), 2) AS avg_rating,
    COUNT(f.userId) AS total_feedbacks,
    IFNULL(SUM(p.amount), 0) AS total_revenue
FROM Event e
LEFT JOIN Feedback f ON e.eventId = f.eventId
LEFT JOIN Ticket t ON e.eventId = t.eventId
LEFT JOIN Booking b ON t.ticketId = b.ticketId
LEFT JOIN Payment p ON b.bookingId = p.bookingId AND p.paymentStatus = 'Successful'
GROUP BY e.eventId, e.title
HAVING avg_rating >= 4;
SELECT * FROM HighRatedEvents;