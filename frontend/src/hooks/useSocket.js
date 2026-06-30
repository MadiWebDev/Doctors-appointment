import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const useSocket = (eventHandlers = {}) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Get token from localStorage (assuming it's stored there)
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Register custom event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketRef.current.on(event, handler);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          socketRef.current.off(event, handler);
        });
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return socketRef.current;
};

export default useSocket;
