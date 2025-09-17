# Database Schema Documentation

## MongoDB Collections Overview

The Sports Booking System uses three main collections in MongoDB:

### 1. Students Collection

**Purpose**: Store student user profiles and authentication data

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "rollNo": "CS2021001", 
  "department": "Computer Science",
  "firebaseUID": "firebase_auth_uid_string",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes**:
- `email` (unique)
- `rollNo` (unique) 
- `firebaseUID` (unique)

**Validation Rules**:
- All fields required
- Email must be valid format
- Roll number must be unique and uppercase
- Firebase UID links to authentication

---

### 2. Grounds Collection

**Purpose**: Store sports facility information and available time slots

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "Football Ground",
  "location": "North Campus Sports Complex",
  "slots": [
    "06:00-07:00",
    "07:00-08:00", 
    "08:00-09:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
    "19:00-20:00"
  ],
  "description": "Full-size football field with grass surface",
  "capacity": 22,
  "isActive": true,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes**:
- `name` (text search)
- `isActive` (filter active grounds)

**Sample Grounds Data**:
1. Football Ground (North Campus)
2. Basketball Court A (Indoor Sports Center)
3. Tennis Court 1 (Tennis Complex)
4. Cricket Ground (South Campus)
5. Badminton Court 1 (Indoor Sports Center)

---

### 3. Bookings Collection

**Purpose**: Store booking records and manage slot reservations

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "studentId": "firebase_auth_uid_string",
  "groundId": ObjectId("507f1f77bcf86cd799439012"),
  "date": ISODate("2024-01-20T00:00:00Z"),
  "slot": "16:00-17:00",
  "status": "confirmed",
  "bookingReference": "BK1705312345ABC",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes**:
- `studentId, date` (compound unique - prevents double booking)
- `groundId, date, slot` (availability queries)
- `bookingReference` (unique booking lookup)
- `status` (filter by booking status)

**Status Values**:
- `confirmed`: Active booking
- `cancelled`: User cancelled
- `completed`: Past booking (automatic)

---

## Relationships

```
Students (1) ←→ (Many) Bookings ←→ (Many) (1) Grounds
```

- **One student** can have **many bookings** (but only one per date)
- **One ground** can have **many bookings** (multiple slots per day)
- **One booking** belongs to **one student** and **one ground**

## Business Rules

### Booking Constraints
1. **One booking per student per date**: Enforced by compound unique index
2. **Slot availability**: Same ground + date + slot cannot be double-booked
3. **Future dates only**: Booking date must be >= today
4. **Valid slots**: Slot must exist in ground's available slots array

### Data Integrity
1. **Referential integrity**: `groundId` must reference existing ground
2. **Authentication link**: `studentId` must match Firebase UID
3. **Automatic reference**: Booking reference auto-generated on creation
4. **Timestamp tracking**: All documents have `createdAt` and `updatedAt`

## Query Patterns

### Common Queries

1. **Check slot availability**:
```javascript
db.bookings.find({
  groundId: ObjectId("..."),
  date: ISODate("2024-01-20"),
  status: { $ne: "cancelled" }
}).distinct("slot")
```

2. **Student's bookings**:
```javascript
db.bookings.find({
  studentId: "firebase_uid",
  status: { $ne: "cancelled" }
}).sort({ date: -1 })
```

3. **Prevent double booking**:
```javascript
db.bookings.findOne({
  studentId: "firebase_uid",
  date: {
    $gte: ISODate("2024-01-20T00:00:00Z"),
    $lt: ISODate("2024-01-20T23:59:59Z")
  },
  status: { $ne: "cancelled" }
})
```

## Performance Considerations

- **Indexes**: Optimized for common query patterns
- **Date queries**: Use date ranges for daily bookings
- **Compound indexes**: Prevent duplicate bookings efficiently
- **Text search**: Ground names indexed for search functionality
- **Pagination**: Implement for large booking lists

## Data Migration

Initial data seeding includes:
- 5 sample sports grounds with time slots
- No initial students (created via registration)
- No initial bookings (created via booking flow)
