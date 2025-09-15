// pages/index.js
"use client";
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import InitialPage from '../components/InitialPage';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import '../styles/globals.css';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <InitialPage/>
    </>
  );
}