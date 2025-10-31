import express from 'express';
import { getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { 
    getUnconnectedUsers, 
    getRoomId, 
    healthCheck ,
    addRoomToUsers 
} from '../controllers/connectionController.js';
// import { protect } from '../middleware/authMiddleware.js';

const router=express.Router();

// New connection-based routes
router.get('/unconnected-users', getUnconnectedUsers);
router.get('/get-room-id', getRoomId);
router.get('/health', healthCheck);
router.post('/add-room', addRoomToUsers); 

router.get('/:id',getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


export default router;