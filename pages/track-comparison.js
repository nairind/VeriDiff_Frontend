// /pages/track-comparison.js
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SummaryCards from '../components/SummaryCards';
import ControlsBar from '../components/ControlsBar';
import ExportSection from '../components/ExportSection';
import { createScrollManager } from '../utils/scrollUtils';
import { getFilteredResults, groupFields } from '../utils/filterUtils';
import { getRecordStatus, getStatusConfig } from '../utils/statusUtils';
import { getCharacterDiff, renderCharacterDiff } from '../utils/characterDiff';
import { handleDownloadExcel, handleDownloadCSV, handleDownloadHTMLDiff } from '../utils/exportUtils';
import { trackAnalytics } from '../utils/analytics';
import { downloadResultsAsCSV } from '../utils/downloadResults';

export default function TrackComparison() {
  const router = useRouter();
  const [scrollManager] = useState(() => createScrollManager());
  
  // Core states
  const [results, setResults] = useState(null);
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);

  // Results display states
  const [resultsFilter, setResultsFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState('unified');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showCharacterDiff, setShowCharacterDiff] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [fieldGrouping, setFieldGrouping] = useState(true
