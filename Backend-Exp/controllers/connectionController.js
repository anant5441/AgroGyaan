import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * GET /api/users/unconnected-users
 * Returns a list of users that are not connected to the given user
 */
export const getUnconnectedUsers = async (req, res, next) => {
    try {
        const { user_id } = req.query;

        // Validate input
        if (!user_id) {
            const error = new Error('User ID is required');
            error.statusCode = 400;
            error.code = 'MISSING_USER_ID';
            throw error;
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            const error = new Error('Invalid user ID format');
            error.statusCode = 400;
            error.code = 'INVALID_USER_ID';
            throw error;
        }

        // Fetch all users from the database with name and role
        const allUsers = await User.find({}).select('_id name role rooms_id');
        
        if (!allUsers || allUsers.length === 0) {
            const error = new Error('No users found in database');
            error.statusCode = 404;
            error.code = 'NO_USERS_FOUND';
            throw error;
        }

        // Find the current user
        const currentUser = allUsers.find(user => user._id.toString() === user_id);
        
        if (!currentUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Extract connected user IDs from rooms_id
        const connectedIds = new Set();
        
        if (currentUser.rooms_id && currentUser.rooms_id.length > 0) {
            currentUser.rooms_id.forEach(roomId => {
                try {
                    // Split room_id by underscore
                    const parts = roomId.split('_');
                    
                    // Room should contain exactly 2 user IDs
                    if (parts.length === 2) {
                        const [id1, id2] = parts;
                        
                        // If current user matches either part, add the other to connectedIds
                        if (user_id === id1) {
                            connectedIds.add(id2);
                        } else if (user_id === id2) {
                            connectedIds.add(id1);
                        }
                    }
                } catch (error) {
                    console.warn(`Invalid room format: ${roomId}`, error);
                }
            });
        }

        // Filter unconnected users (not in connectedIds and not the current user)
        const unconnectedUsers = allUsers
            .filter(user => {
                const userId = user._id.toString();
                return userId !== user_id && !connectedIds.has(userId);
            })
            .map(user => ({
                id: user._id,
                name: user.name,
                role: user.role
            }));

        res.json({
            success: true,
            unconnected_users: unconnectedUsers,
            metadata: {
                total_users: allUsers.length,
                connected_users: connectedIds.size,
                unconnected_users: unconnectedUsers.length
            }
        });

    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/users/get-room-id
 * Returns a deterministic room ID for two given user IDs with the other user's details
 */
export const getRoomId = async (req, res, next) => {
    try {
        const { id1, id2 } = req.query;

        // Validate inputs
        if (!id1 || !id2) {
            const error = new Error('Both id1 and id2 are required');
            error.statusCode = 400;
            error.code = 'MISSING_IDS';
            throw error;
        }

        // Check if IDs are the same
        if (id1 === id2) {
            const error = new Error('Cannot create room with same user');
            error.statusCode = 400;
            error.code = 'SAME_USER_IDS';
            throw error;
        }

        // Validate ObjectId format for both IDs
        if (!mongoose.Types.ObjectId.isValid(id1) || !mongoose.Types.ObjectId.isValid(id2)) {
            const error = new Error('Invalid user ID format');
            error.statusCode = 400;
            error.code = 'INVALID_USER_ID';
            throw error;
        }

        // Sort IDs lexicographically to maintain consistent order
        const sortedIds = [id1, id2].sort();
        
        // Generate room ID in format: smallerId_largerId
        const roomId = `${sortedIds[0]}_${sortedIds[1]}`;

        // Store room ID in both users' rooms_id arrays (only if not already present)
        const updatePromises = [];

        // Fetch users with name and role fields
        const user1 = await User.findById(id1).select('name role rooms_id');
        const user2 = await User.findById(id2).select('name role rooms_id');

        // Check if both users exist
        if (!user1 || !user2) {
            const error = new Error('One or both users not found');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Add room ID to user1 if not already present
        if (!user1.rooms_id.includes(roomId)) {
            updatePromises.push(
                User.findByIdAndUpdate(
                    id1,
                    { $addToSet: { rooms_id: roomId } }, // $addToSet prevents duplicates
                    { new: true }
                )
            );
        }

        // Add room ID to user2 if not already present
        if (!user2.rooms_id.includes(roomId)) {
            updatePromises.push(
                User.findByIdAndUpdate(
                    id2,
                    { $addToSet: { rooms_id: roomId } },
                    { new: true }
                )
            );
        }

        // Wait for both updates to complete
        if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
        }

        // ✅ Determine which user is "me" and which is "other"
        // Typically, the first ID (id1) is considered the current user
        // You can adjust this logic based on how you pass the IDs
        const currentUserId = id1; // Assuming id1 is the current user
        const otherUser = currentUserId === user1._id.toString() ? user2 : user1;

        res.json({
            success: true,
            room_id: roomId,
            other_user: {
                id: otherUser._id,
                name: otherUser.name,
                role: otherUser.role
            },
            message: updatePromises.length > 0 ? 'Room created and stored in both users' : 'Room already exists for both users'
        });

    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/users/my-rooms
 * Returns all rooms for a user with details of the other person in each room
 * Query Param: user_id - The ID of the user to get rooms for
 */
export const getUserRoom = async (req, res, next) => {
    try {
        const { user_id } = req.query;

        // Validate input
        if (!user_id) {
            const error = new Error('User ID is required');
            error.statusCode = 400;
            error.code = 'MISSING_USER_ID';
            throw error;
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            const error = new Error('Invalid user ID format');
            error.statusCode = 400;
            error.code = 'INVALID_USER_ID';
            throw error;
        }

        // Find the current user with their rooms
        const currentUser = await User.findById(user_id).select('rooms_id');
        
        if (!currentUser) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // If user has no rooms, return empty array
        if (!currentUser.rooms_id || currentUser.rooms_id.length === 0) {
            return res.json({
                success: true,
                rooms: [],
                message: 'No rooms found for this user'
            });
        }

        // Array to store room details
        const roomsWithDetails = [];

        // Process each room to get the other user's details
        for (const roomId of currentUser.rooms_id) {
            try {
                // Split room_id by underscore to get both user IDs
                const parts = roomId.split('_');
                
                // Room should contain exactly 2 user IDs
                if (parts.length === 2) {
                    const [user1Id, user2Id] = parts;
                    
                    // Determine which user is the other person
                    let otherUserId;
                    if (user_id === user1Id) {
                        otherUserId = user2Id;
                    } else if (user_id === user2Id) {
                        otherUserId = user1Id;
                    } else {
                        // Skip if current user is not in this room (shouldn't happen normally)
                        continue;
                    }

                    // Validate the other user's ID
                    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
                        console.warn(`Invalid user ID in room: ${otherUserId}`);
                        continue;
                    }

                    // Fetch the other user's details
                    const otherUser = await User.findById(otherUserId).select('name role');
                    
                    if (otherUser) {
                        roomsWithDetails.push({
                            id: roomId, // Room ID as the identifier
                            name: otherUser.name,
                            role: otherUser.role,
                            other_user_id: otherUser._id // Also include the actual user ID if needed
                        });
                    } else {
                        console.warn(`Other user not found for ID: ${otherUserId}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing room ${roomId}:`, error);
                // Continue with next room even if one fails
                continue;
            }
        }

        res.json({
            success: true,
            rooms: roomsWithDetails,
            metadata: {
                total_rooms: currentUser.rooms_id.length,
                rooms_with_details: roomsWithDetails.length
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/users/health
 * Health check endpoint for users routes
 */
export const healthCheck = (req, res) => {
    res.json({
        success: true,
        message: 'Users API is healthy'
    });
    };

// Function to manually add a room to users (if needed separately)
export const addRoomToUsers = async (req, res, next) => {
    try {
        const { user_id1, user_id2 } = req.body;

        // Validate inputs
        if (!user_id1 || !user_id2) {
            const error = new Error('Both user_id1 and user_id2 are required');
            error.statusCode = 400;
            error.code = 'MISSING_USER_IDS';
            throw error;
        }

        // Check if IDs are the same
        if (user_id1 === user_id2) {
            const error = new Error('Cannot create room with same user');
            error.statusCode = 400;
            error.code = 'SAME_USER_IDS';
            throw error;
        }

        // Validate ObjectId format for both IDs
        if (!mongoose.Types.ObjectId.isValid(user_id1) || !mongoose.Types.ObjectId.isValid(user_id2)) {
            const error = new Error('Invalid user ID format');
            error.statusCode = 400;
            error.code = 'INVALID_USER_ID';
            throw error;
        }

        // Check if both users exist and get their details
        const user1 = await User.findById(user_id1).select('name role');
        const user2 = await User.findById(user_id2).select('name role');
        
        if (!user1 || !user2) {
            const error = new Error('One or both users not found');
            error.statusCode = 404;
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Generate room ID
        const sortedIds = [user_id1, user_id2].sort();
        const roomId = `${sortedIds[0]}_${sortedIds[1]}`;

        // Add room to both users
        await User.findByIdAndUpdate(
            user_id1,
            { $addToSet: { rooms_id: roomId } }
        );

        await User.findByIdAndUpdate(
            user_id2,
            { $addToSet: { rooms_id: roomId } }
        );

        // ✅ Determine which user is "me" and which is "other"
        // Assuming user_id1 is the current user making the request
        const currentUserId = user_id1;
        const otherUser = currentUserId === user1._id.toString() ? user2 : user1;

        res.json({
            success: true,
            room_id: roomId,
            other_user: {
                id: otherUser._id,
                name: otherUser.name,
                role: otherUser.role
            },
            message: 'Room successfully added to both users'
        });

    } catch (error) {
        next(error);
    }
};