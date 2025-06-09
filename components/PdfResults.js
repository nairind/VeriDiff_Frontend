// components/PdfResults.js - Enhanced Version
import { useState, useEffect } from 'react';

const PdfResults = ({ results, file1Name, file2Name, options = {} }) => {
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'sideBySide'
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false);

  // Enhanced download options with interactive HTML
  const downloadOptions = [
    {
      id: 'interactive',
      label: '🌐 Interactive HTML',
      description: 'Self-contained web page with live filtering and synchronized scrolling',
      format: 'html'
    },
    {
      id: 'html',
      label: '📄 Static HTML Report',
      description: 'Traditional web page with side-by-side view',
      format: 'html'
    },
    {
      id: 'excel',
      label: '📊 Excel Export',
      description: 'Structured data with change analysis',
      format: 'xlsx'
    },
    {
      id: 'csv',
      label: '📋 CSV Data',
      description: 'Raw comparison data for analysis',
      format: 'csv'
    },
    {
      id: 'text',
      label: '📝 Text Report',
      description: 'Detailed text-based comparison report',
      format: 'txt'
    }
  ];

  // Setup synchronized scrolling for side-by-side view
  useEffect(() => {
    if (viewMode === 'sideBySide') {
      const doc1 = document.getElementById('sideBySideDoc1');
      const doc2 = document.getElementById('sideBySideDoc2');
      
      if (doc1 && doc2) {
        let isScrolling = false;
        
        const handleDoc1Scroll = function() {
          if (!isScrolling) {
            isScrolling = true;
            const scrollRatio = this.scrollTop / (this.scrollHeight - this.clientHeight);
            doc2.scrollTop = scrollRatio * (doc2.scrollHeight - doc2.clientHeight);
            setTimeout(() => isScrolling = false, 10);
          }
        };
        
        const handleDoc2Scroll = function() {
          if (!isScrolling) {
            isScrolling = true;
            const scrollRatio = this.scrollTop / (this.scrollHeight - this.clientHeight);
            doc1.scrollTop = scrollRatio * (doc1.scrollHeight - doc1.clientHeight);
            setTimeout(() => isScrolling = false, 10);
          }
        };
        
        doc1.addEventListener('scroll', handleDoc1Scroll);
        doc2.addEventListener('scroll', handleDoc2Scroll);
        
        // Cleanup event listeners
        return () => {
          doc1.removeEventListener('scroll', handleDoc1Scroll);
          doc2.removeEventListener('scroll', handleDoc2Scroll);
        };
      }
    }
  }, [viewMode]);

  // Generate interactive HTML with embedded filtering (from my ExportSection)
  const generateInteractiveHTML = () => {
    const allChanges = results?.text_changes || [];
    const file1Pages = results?.file1_pages || [];
    const file2Pages = results?.file2_pages || [];
    const totalPages = Math.max(file1Pages.length, file2Pages.length);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive PDF Comparison - ${file1Name} vs ${file2Name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 2rem;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            min-width: 120px;
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2563eb;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #6b7280;
            margin-top: 5px;
        }
        
        .filters {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .filter-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .filter-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .filter-label {
            font-weight: 500;
            color: #374151;
            font-size: 0.9rem;
        }
        
        .filter-input {
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 0.85rem;
        }
        
        .filter-button {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s ease;
        }
        
        .filter-button.active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
        }
        
        .filter-button:hover {
            background: #f3f4f6;
        }
        
        .filter-button.active:hover {
            background: #2563eb;
        }
        
        .search-input {
            flex: 1;
            min-width: 200px;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .reset-btn {
            background: #6b7280;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
        }
        
        .reset-btn:hover {
            background: #4b5563;
        }
        
        .comparison-container {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .document-panel {
            flex: 1;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .document-header {
            background: #f8fafc;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .document-content {
            height: 600px;
            overflow-y: auto;
            padding: 25px;
        }
        
        .page {
            margin-bottom: 40px;
        }
        
        .page-header {
            background: #f3f4f6;
            padding: 10px 15px;
            border-radius: 6px;
            font-weight: 600;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
        
        .paragraph {
            margin-bottom: 15px;
            padding: 6px 0;
            line-height: 1.7;
        }
        
        .paragraph.added {
            background: #dcfce7;
            border: 1px solid #166534;
            color: #166534;
            padding: 10px 15px;
            border-radius: 6px;
            font-weight: 500;
        }
        
        .paragraph.removed {
            background: #fee2e2;
            border: 1px solid #dc2626;
            color: #dc2626;
            padding: 10px 15px;
            border-radius: 6px;
            font-weight: 500;
        }
        
        .paragraph.modified {
            background: #fef3c7;
            border: 1px solid #d97706;
            color: #92400e;
            padding: 10px 15px;
            border-radius: 6px;
            font-weight: 500;
        }
        
        .paragraph.unchanged {
            color: #374151;
        }
        
        .paragraph.filtered {
            opacity: 0.3;
            color: #9ca3af;
        }
        
        .highlight {
            background: #fbbf24;
            font-weight: bold;
            padding: 2px 4px;
            border-radius: 2px;
        }
        
        .legend {
            display: flex;
            justify-content: center;
            gap: 25px;
            margin-bottom: 30px;
            font-size: 0.9rem;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
            border: 1px solid;
        }
        
        .footer {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .comparison-container {
                flex-direction: column;
                gap: 20px;
            }
            
            .stats {
                gap: 15px;
            }
            
            .filter-row {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            
            .filter-group {
                justify-content: space-between;
            }
            
            .document-content {
                height: 400px;
                padding: 20px;
            }
        }
        
        .no-results {
            text-align: center;
            padding: 40px;
            color: #6b7280;
            font-style: italic;
        }
        
        .loading-controls {
            text-align: center;
            padding: 20px;
            background: #eff6ff;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .load-more-btn {
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin: 0 5px;
            font-size: 0.85rem;
        }
        
        .load-more-btn:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📄 Interactive PDF Comparison Report</h1>
            <p style="color: #6b7280; margin-bottom: 15px;">
                <strong>${file1Name || 'Document 1'}</strong> vs <strong>${file2Name || 'Document 2'}</strong>
            </p>
            <p style="color: #6b7280; font-size: 0.9rem;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
            
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-number">${results?.similarity_score || 0}%</div>
                    <div class="stat-label">Similarity</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${allChanges.length}</div>
                    <div class="stat-label">Total Changes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalPages}</div>
                    <div class="stat-label">Pages</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${allChanges.filter(c => c.type === 'added').length}</div>
                    <div class="stat-label">Added</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${allChanges.filter(c => c.type === 'removed').length}</div>
                    <div class="stat-label">Removed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${allChanges.filter(c => c.type === 'modified').length}</div>
                    <div class="stat-label">Modified</div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters">
            <div class="filter-row">
                <div class="filter-group">
                    <span class="filter-label">📄 Pages:</span>
                    <input type="number" id="pageStart" class="filter-input" value="1" min="1" max="${totalPages}" style="width: 60px;">
                    <span>to</span>
                    <input type="number" id="pageEnd" class="filter-input" value="${totalPages}" min="1" max="${totalPages}" style="width: 60px;">
                    <span style="font-size: 0.8rem; color: #6b7280;">of ${totalPages}</span>
                </div>
                
                <div class="filter-group">
                    <span class="filter-label">📋 Load:</span>
                    <button id="loadModeBtn" class="filter-button active">15 pages</button>
                </div>
            </div>

            <div class="filter-row">
                <div class="filter-group">
                    <span class="filter-label">🎯 Changes:</span>
                    <button class="filter-button active" data-type="added">✓ Added</button>
                    <button class="filter-button active" data-type="removed">✓ Removed</button>
                    <button class="filter-button active" data-type="modified">✓ Modified</button>
                    <button class="filter-button active" data-type="unchanged">✓ Unchanged</button>
                </div>
            </div>

            <div class="filter-row">
                <div class="filter-group" style="flex: 1;">
                    <span class="filter-label">🔍</span>
                    <input type="text" id="searchInput" class="search-input" placeholder="Search text in documents...">
                </div>
                <button id="resetBtn" class="reset-btn">Reset Filters</button>
            </div>
        </div>

        <!-- Legend -->
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #dcfce7; border-color: #166534;"></div>
                <span>Added</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #fee2e2; border-color: #dc2626;"></div>
                <span>Removed</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #fef3c7; border-color: #d97706;"></div>
                <span>Modified</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f9fafb; border-color: #d1d5db;"></div>
                <span>Unchanged</span>
            </div>
        </div>

        <!-- Comparison Container -->
        <div class="comparison-container">
            <div class="document-panel">
                <div class="document-header">
                    📄 ${file1Name || 'Document 1'} <span id="doc1PageCount" style="font-size: 0.8rem; color: #6b7280;"></span>
                </div>
                <div class="document-content" id="document1"></div>
            </div>
            <div class="document-panel">
                <div class="document-header">
                    📄 ${file2Name || 'Document 2'} <span id="doc2PageCount" style="font-size: 0.8rem; color: #6b7280;"></span>
                </div>
                <div class="document-content" id="document2"></div>
            </div>
        </div>

        <!-- Loading Controls -->
        <div id="loadingControls" class="loading-controls" style="display: none;">
            <span id="loadingStatus"></span>
            <button id="loadMoreBtn" class="load-more-btn">Load More</button>
            <button id="loadAllBtn" class="load-more-btn">Load All</button>
        </div>

        <!-- Footer -->
        <div class="footer">
            <strong>Interactive PDF Comparison Report</strong><br>
            Use the filters above to focus on specific changes, pages, or search for particular content.<br>
            Documents scroll together for easy side-by-side comparison.
        </div>
    </div>

    <script>
        // Data
        const allChanges = ${JSON.stringify(allChanges)};
        const file1Pages = ${JSON.stringify(file1Pages)};
        const file2Pages = ${JSON.stringify(file2Pages)};
        const totalPages = ${totalPages};
        
        // State
        let currentPageBatch = 15;
        let loadingMode = 'virtual';
        let activeChangeTypes = { added: true, removed: true, modified: true, unchanged: true };
        let searchText = '';
        let pageRangeStart = 1;
        let pageRangeEnd = totalPages;
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            updateDisplay();
        });
        
        function setupEventListeners() {
            // Page range inputs
            document.getElementById('pageStart').addEventListener('input', function() {
                pageRangeStart = Math.max(1, parseInt(this.value) || 1);
                updateDisplay();
            });
            
            document.getElementById('pageEnd').addEventListener('input', function() {
                pageRangeEnd = Math.min(totalPages, parseInt(this.value) || totalPages);
                updateDisplay();
            });
            
            // Change type filters
            document.querySelectorAll('[data-type]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.dataset.type;
                    activeChangeTypes[type] = !activeChangeTypes[type];
                    this.classList.toggle('active');
                    this.textContent = activeChangeTypes[type] ? '✓ ' + capitalizeFirst(type) : '○ ' + capitalizeFirst(type);
                    updateDisplay();
                });
            });
            
            // Search input
            let searchTimeout;
            document.getElementById('searchInput').addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchText = this.value;
                    updateDisplay();
                }, 300);
            });
            
            // Load mode toggle
            document.getElementById('loadModeBtn').addEventListener('click', function() {
                if (loadingMode === 'virtual') {
                    loadingMode = 'all';
                    this.textContent = 'All pages';
                    this.classList.remove('active');
                } else {
                    loadingMode = 'virtual';
                    currentPageBatch = 15;
                    this.textContent = '15 pages';
                    this.classList.add('active');
                }
                updateDisplay();
            });
            
            // Load more/all buttons
            document.getElementById('loadMoreBtn').addEventListener('click', function() {
                currentPageBatch = Math.min(currentPageBatch + 15, pageRangeEnd - pageRangeStart + 1);
                updateDisplay();
            });
            
            document.getElementById('loadAllBtn').addEventListener('click', function() {
                loadingMode = 'all';
                document.getElementById('loadModeBtn').textContent = 'All pages';
                document.getElementById('loadModeBtn').classList.remove('active');
                updateDisplay();
            });
            
            // Reset button
            document.getElementById('resetBtn').addEventListener('click', function() {
                pageRangeStart = 1;
                pageRangeEnd = totalPages;
                activeChangeTypes = { added: true, removed: true, modified: true, unchanged: true };
                searchText = '';
                loadingMode = 'virtual';
                currentPageBatch = 15;
                
                document.getElementById('pageStart').value = 1;
                document.getElementById('pageEnd').value = totalPages;
                document.getElementById('searchInput').value = '';
                document.getElementById('loadModeBtn').textContent = '15 pages';
                document.getElementById('loadModeBtn').classList.add('active');
                
                document.querySelectorAll('[data-type]').forEach(btn => {
                    btn.classList.add('active');
                    btn.textContent = '✓ ' + capitalizeFirst(btn.dataset.type);
                });
                
                updateDisplay();
            });
            
            // Synchronized scrolling
            const doc1 = document.getElementById('document1');
            const doc2 = document.getElementById('document2');
            let isScrolling = false;
            
            doc1.addEventListener('scroll', function() {
                if (!isScrolling) {
                    isScrolling = true;
                    const scrollRatio = this.scrollTop / (this.scrollHeight - this.clientHeight);
                    doc2.scrollTop = scrollRatio * (doc2.scrollHeight - doc2.clientHeight);
                    setTimeout(() => isScrolling = false, 10);
                }
            });
            
            doc2.addEventListener('scroll', function() {
                if (!isScrolling) {
                    isScrolling = true;
                    const scrollRatio = this.scrollTop / (this.scrollHeight - this.clientHeight);
                    doc1.scrollTop = scrollRatio * (doc1.scrollHeight - doc1.clientHeight);
                    setTimeout(() => isScrolling = false, 10);
                }
            });
        }
        
        function findParagraphChange(pageNumber, paragraphIndex, fileNumber) {
            return allChanges.find(change => 
                change.page === pageNumber && 
                change.paragraph === paragraphIndex &&
                (change.file === 'file' + fileNumber || change.file === 'both')
            );
        }
        
        function highlightSearchText(text, searchTerm) {
            if (!searchTerm.trim()) return text;
            
            // Simple case-insensitive text highlighting without regex complications
            const lowerText = text.toLowerCase();
            const lowerTerm = searchTerm.toLowerCase().trim();
            
            if (!lowerText.includes(lowerTerm)) return text;
            
            let result = '';
            let lastIndex = 0;
            let index = lowerText.indexOf(lowerTerm);
            
            while (index !== -1) {
                // Add text before match
                result += text.substring(lastIndex, index);
                // Add highlighted match
                result += '<span class="highlight">' + text.substring(index, index + lowerTerm.length) + '</span>';
                lastIndex = index + lowerTerm.length;
                index = lowerText.indexOf(lowerTerm, lastIndex);
            }
            
            // Add remaining text
            result += text.substring(lastIndex);
            return result;
        }
        
        function filterPages(pages, fileNumber) {
            const startIdx = pageRangeStart - 1;
            const endIdx = pageRangeEnd;
            
            return pages.slice(startIdx, endIdx).filter(page => {
                // Search filter
                if (searchText.trim()) {
                    const searchLower = searchText.toLowerCase();
                    const hasSearchText = page.paragraphs.some(para => 
                        para.text.toLowerCase().includes(searchLower)
                    );
                    if (!hasSearchText) return false;
                }
                
                // Change type filter
                const pageHasRelevantChanges = page.paragraphs.some((para, paraIndex) => {
                    const change = findParagraphChange(page.page_number, paraIndex, fileNumber);
                    if (!change) return activeChangeTypes.unchanged;
                    return activeChangeTypes[change.type];
                });
                
                return pageHasRelevantChanges;
            });
        }
        
        function updateDisplay() {
            const filteredFile1 = filterPages(file1Pages, 1);
            const filteredFile2 = filterPages(file2Pages, 2);
            
            // Apply virtual loading
            let displayFile1 = filteredFile1;
            let displayFile2 = filteredFile2;
            
            if (loadingMode === 'virtual') {
                displayFile1 = filteredFile1.slice(0, currentPageBatch);
                displayFile2 = filteredFile2.slice(0, currentPageBatch);
            }
            
            renderDocument(displayFile1, 'document1', 1);
            renderDocument(displayFile2, 'document2', 2);
            
            // Update page counts
            document.getElementById('doc1PageCount').textContent = '(' + displayFile1.length + ' pages shown)';
            document.getElementById('doc2PageCount').textContent = '(' + displayFile2.length + ' pages shown)';
            
            // Update loading controls
            updateLoadingControls(filteredFile1.length, filteredFile2.length);
        }
        
        function renderDocument(pages, containerId, fileNumber) {
            const container = document.getElementById(containerId);
            
            if (pages.length === 0) {
                container.innerHTML = '<div class="no-results">No pages match the current filters</div>';
                return;
            }
            
            let html = '';
            
            pages.forEach(page => {
                html += '<div class="page">';
                html += '<div class="page-header">Page ' + page.page_number + '</div>';
                
                page.paragraphs.forEach((para, paraIndex) => {
                    const change = findParagraphChange(page.page_number, paraIndex, fileNumber);
                    const changeType = change ? change.type : 'unchanged';
                    const isFiltered = change ? !activeChangeTypes[changeType] : !activeChangeTypes.unchanged;
                    
                    const className = 'paragraph ' + changeType + (isFiltered ? ' filtered' : '');
                    const content = highlightSearchText(para.text, searchText);
                    
                    html += '<div class="' + className + '">' + content + '</div>';
                });
                
                html += '</div>';
            });
            
            container.innerHTML = html;
        }
        
        function updateLoadingControls(file1Count, file2Count) {
            const controls = document.getElementById('loadingControls');
            const status = document.getElementById('loadingStatus');
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            
            if (loadingMode === 'virtual') {
                const maxCount = Math.max(file1Count, file2Count);
                const totalInRange = pageRangeEnd - pageRangeStart + 1;
                
                if (currentPageBatch < maxCount) {
                    controls.style.display = 'block';
                    status.textContent = 'Showing ' + currentPageBatch + ' of ' + maxCount + ' filtered pages';
                    loadMoreBtn.style.display = 'inline-block';
                } else {
                    controls.style.display = 'none';
                }
            } else {
                controls.style.display = 'none';
            }
        }
        
        function capitalizeFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    </script>
</body>
</html>`;
  };

  // Toggle page expansion
  const togglePageExpansion = (pageNumber) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageNumber)) {
      newExpanded.delete(pageNumber);
    } else {
      newExpanded.add(pageNumber);
    }
    setExpandedPages(newExpanded);
  };

  // Expand/collapse all pages
  const toggleAllPages = () => {
    if (expandedPages.size === results.page_differences?.length) {
      setExpandedPages(new Set());
    } else {
      const allPages = new Set(results.page_differences?.map(p => p.page_number) || []);
      setExpandedPages(allPages);
    }
  };

  // Generate HTML report with embedded side-by-side view (existing static version)
  const generateHTMLReport = () => {
    const timestamp = new Date().toLocaleString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Comparison Report - ${file1Name} vs ${file2Name}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8fafc; 
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #e5e7eb; 
        }
        .title { 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 10px; 
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle { 
            color: #6b7280; 
            font-size: 1.1rem; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .summary-card { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #e5e7eb; 
        }
        .summary-card h3 { 
            margin: 0 0 15px 0; 
            color: #1f2937; 
            font-size: 1.1rem; 
        }
        .summary-card .metric { 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 5px; 
        }
        .similarity-high { color: #22c55e; }
        .similarity-medium { color: #f59e0b; }
        .similarity-low { color: #ef4444; }
        .side-by-side { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 30px 0; 
        }
        .document-panel { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            overflow: hidden; 
        }
        .document-header { 
            background: #f8fafc; 
            padding: 15px; 
            font-weight: 600; 
            border-bottom: 1px solid #e5e7eb; 
        }
        .document-content { 
            padding: 20px; 
            max-height: 600px; 
            overflow-y: auto; 
        }
        .page { 
            margin-bottom: 30px; 
        }
        .page-header { 
            background: #f3f4f6; 
            padding: 8px 12px; 
            border-radius: 4px; 
            font-weight: 600; 
            margin-bottom: 15px; 
            font-size: 0.9rem; 
        }
        .paragraph { 
            margin-bottom: 12px; 
            padding: 4px 0; 
            line-height: 1.6; 
        }
        .added { 
            background: #dcfce7; 
            border: 1px solid #166534; 
            color: #166534; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-weight: 500; 
        }
        .removed { 
            background: #fee2e2; 
            border: 1px solid #dc2626; 
            color: #dc2626; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-weight: 500; 
        }
        .modified { 
            background: #fef3c7; 
            border: 1px solid #d97706; 
            color: #92400e; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-weight: 500; 
        }
        .legend { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 20px 0; 
            font-size: 0.9rem; 
        }
        .legend-item { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
        }
        .legend-box { 
            width: 16px; 
            height: 16px; 
            border-radius: 3px; 
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #6b7280; 
            font-size: 0.9rem; 
        }
        @media (max-width: 768px) {
            .side-by-side { grid-template-columns: 1fr; }
            .summary-grid { grid-template-columns: 1fr; }
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">📑 PDF Comparison Report</h1>
            <p class="subtitle">Generated on ${timestamp}</p>
            <p><strong>${file1Name || 'Document 1'}</strong> vs <strong>${file2Name || 'Document 2'}</strong></p>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <h3>📊 Overall Similarity</h3>
                <div class="metric ${results.similarity_score >= 90 ? 'similarity-high' : results.similarity_score >= 70 ? 'similarity-medium' : 'similarity-low'}">
                    ${results.similarity_score || 0}%
                </div>
                <p>Document similarity score</p>
            </div>
            <div class="summary-card">
                <h3>📄 Pages Compared</h3>
                <div class="metric" style="color: #2563eb;">${results.total_pages || 0}</div>
                <p>${results.page_differences?.length || 0} pages with changes</p>
            </div>
            <div class="summary-card">
                <h3>🔍 Changes Found</h3>
                <div class="metric" style="color: #7c3aed;">${results.differences_found || 0}</div>
                <p>Total differences detected</p>
            </div>
            <div class="summary-card">
                <h3>📝 Word Analysis</h3>
                <div class="metric" style="color: #059669;">
                    ${results.word_changes?.file1_words || 0} → ${results.word_changes?.file2_words || 0}
                </div>
                <p>${results.word_changes?.word_change_percentage || 0}% word change</p>
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <div class="legend-box" style="background: #dcfce7; border: 1px solid #166534;"></div>
                <span>Added Content</span>
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background: #fee2e2; border: 1px solid #dc2626;"></div>
                <span>Removed Content</span>
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background: #fef3c7; border: 1px solid #d97706;"></div>
                <span>Modified Content</span>
            </div>
        </div>

        <div class="side-by-side">
            <div class="document-panel">
                <div class="document-header">📄 ${file1Name || 'Document 1'}</div>
                <div class="document-content">
                    ${(results.file1_pages || []).map(page => `
                        <div class="page">
                            <div class="page-header">Page ${page.page_number}</div>
                            ${(page.paragraphs || []).map((para, index) => {
                                const change = (results.text_changes || []).find(c => 
                                    c.page === page.page_number && c.paragraph === index
                                );
                                const changeClass = change ? change.type : '';
                                return `<div class="paragraph ${changeClass}">${para.text}</div>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="document-panel">
                <div class="document-header">📄 ${file2Name || 'Document 2'}</div>
                <div class="document-content">
                    ${(results.file2_pages || []).map(page => `
                        <div class="page">
                            <div class="page-header">Page ${page.page_number}</div>
                            ${(page.paragraphs || []).map((para, index) => {
                                const change = (results.text_changes || []).find(c => 
                                    c.page === page.page_number && c.paragraph === index
                                );
                                const changeClass = change ? change.type : '';
                                return `<div class="paragraph ${changeClass}">${para.text}</div>`;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by VeriDiff - Professional File Comparison Tool</p>
            <p>Processing time: ${results.processing_time?.total_time_ms || 'N/A'}ms | 
               Quality: ${Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}%</p>
        </div>
    </div>
</body>
</html>`;
  };

  // Generate CSV export
  const generateCSVData = () => {
    const headers = ['Page', 'Paragraph', 'Change_Type', 'Original_Text', 'New_Text', 'Character_Count', 'File_Source'];
    const rows = [headers];

    (results.text_changes || []).forEach(change => {
      rows.push([
        change.page,
        change.paragraph,
        change.type,
        change.type === 'modified' ? change.old_text : change.text,
        change.type === 'modified' ? change.new_text : '',
        change.char_count || change.char_count_old || 0,
        change.file
      ]);
    });

    return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  // Generate comprehensive text report
  const generateDetailedReport = () => {
    const timestamp = new Date().toLocaleString();
    const line = '='.repeat(80);
    
    return `${line}
PDF DOCUMENT COMPARISON REPORT
Generated: ${timestamp}
${line}

FILE INFORMATION:
• File 1: ${file1Name || 'Document 1'}
• File 2: ${file2Name || 'Document 2'}

DOCUMENT STATISTICS:
• File 1: ${results.file1_metadata?.totalPages || 0} pages, ${results.file1_metadata?.totalWords || 0} words
• File 2: ${results.file2_metadata?.totalPages || 0} pages, ${results.file2_metadata?.totalWords || 0} words
• Total Pages Compared: ${results.total_pages || 0}

COMPARISON SUMMARY:
• Overall Similarity: ${results.similarity_score || 0}%
• Total Differences Found: ${results.differences_found || 0}
• Total Matches Found: ${results.matches_found || 0}
• Pages with Changes: ${results.page_differences?.length || 0}

CHANGE BREAKDOWN:
• Added Content: ${results.added_count || 0} items
• Removed Content: ${results.removed_count || 0} items
• Modified Content: ${results.modified_count || 0} items

WORD COUNT ANALYSIS:
• File 1 Total Words: ${results.word_changes?.file1_words || 0}
• File 2 Total Words: ${results.word_changes?.file2_words || 0}
• Word Difference: ${results.word_changes?.word_difference || 0}
• Word Change Percentage: ${results.word_changes?.word_change_percentage || 0}%

${line}
DETAILED CHANGES BY PAGE:
${line}

${results.page_differences?.map(page => `
PAGE ${page.page_number} - ${page.changes_count} Change${page.changes_count > 1 ? 's' : ''}:
${'-'.repeat(40)}
${results.text_changes
  ?.filter(change => change.page === page.page_number)
  ?.map((change, index) => {
    let changeText = `${index + 1}. [${change.type.toUpperCase()}] `;
    if (change.type === 'modified') {
      changeText += `Paragraph ${change.paragraph}:\n   OLD: "${change.old_text}"\n   NEW: "${change.new_text}"`;
    } else {
      changeText += `Paragraph ${change.paragraph}: "${change.text}"`;
    }
    return changeText;
  }).join('\n\n') || 'No detailed changes available'}
`).join('\n') || 'No page differences found'}

${line}
PROCESSING INFORMATION:
• Comparison Type: ${results.comparison_type || 'PDF Document'}
• Processing Method: ${results.processing_note || 'Standard PDF comparison'}
• Processing Time: ${results.processing_time?.total_time_ms || 'N/A'}ms
• Quality Rate: ${Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}%

${line}
TECHNICAL DETAILS:
• File 1 Success Rate: ${Math.round((results.quality_metrics?.file1_success_rate || 1) * 100)}%
• File 2 Success Rate: ${Math.round((results.quality_metrics?.file2_success_rate || 1) * 100)}%
• Comparison Options: ${JSON.stringify(options, null, 2)}

${line}
END OF REPORT
${line}`;
  };

  // Helper function to trigger download
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enhanced download function with multiple options
  const downloadComparisonData = async (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    try {
      setIsGeneratingDownload(true);
      setDownloadDropdownOpen(false);
      
      switch (format) {
        case 'interactive':
          const interactiveHtml = generateInteractiveHTML();
          const interactiveBlob = new Blob([interactiveHtml], { type: 'text/html' });
          downloadBlob(interactiveBlob, `Interactive_PDF_Comparison_${timestamp}.html`);
          break;

        case 'html':
          const htmlContent = generateHTMLReport();
          const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
          downloadBlob(htmlBlob, `PDF_Comparison_Report_${timestamp}.html`);
          break;

        case 'excel':
          // For now, export as enhanced CSV with Excel-compatible format
          const csvContent = generateCSVData();
          const csvBlob = new Blob([csvContent], { type: 'text/csv' });
          downloadBlob(csvBlob, `PDF_Comparison_Data_${timestamp}.csv`);
          break;

        case 'csv':
          const csvData = generateCSVData();
          const csvDataBlob = new Blob([csvData], { type: 'text/csv' });
          downloadBlob(csvDataBlob, `PDF_Changes_${timestamp}.csv`);
          break;

        case 'text':
        default:
          const textContent = generateDetailedReport();
          const textBlob = new Blob([textContent], { type: 'text/plain' });
          downloadBlob(textBlob, `PDF_Comparison_Report_${timestamp}.txt`);
          break;
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to generate ${format.toUpperCase()} export: ${error.message}`);
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  // Get status color for different change types
  const getChangeColor = (type) => {
    switch (type) {
      case 'added': return '#22c55e';
      case 'removed': return '#ef4444';
      case 'modified': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Get status background color
  const getChangeBackground = (type) => {
    switch (type) {
      case 'added': return '#dcfce7';
      case 'removed': return '#fee2e2';
      case 'modified': return '#fef3c7';
      default: return '#f3f4f6';
    }
  };

  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        No PDF comparison results to display.
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '30px',
      marginTop: '30px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header Section with View Toggle and Downloads */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          margin: 0,
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📑 PDF Comparison Results
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Toggle Buttons */}
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('summary')}
              style={{
                background: viewMode === 'summary' ? 'white' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: viewMode === 'summary' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'summary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📊 Summary View
            </button>
            <button
              onClick={() => setViewMode('sideBySide')}
              style={{
                background: viewMode === 'sideBySide' ? 'white' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: viewMode === 'sideBySide' ? '#2563eb' : '#6b7280',
                boxShadow: viewMode === 'sideBySide' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              📄 Side-by-Side View
            </button>
          </div>

          {/* Enhanced Download Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
              disabled={isGeneratingDownload}
              style={{
                background: isGeneratingDownload ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isGeneratingDownload ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isGeneratingDownload ? '⏳' : '📥'} 
              {isGeneratingDownload ? 'Generating...' : 'Download Report'} ⌄
            </button>

            {downloadDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '300px',
                marginTop: '4px'
              }}>
                {downloadOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => downloadComparisonData(option.id)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '12px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'summary' ? (
        /* SUMMARY VIEW - All existing functionality preserved */
        <>
          {/* File Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>
                📄 File 1: {file1Name || 'Document 1'}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                <div>📊 {results.file1_metadata?.totalPages || 0} pages</div>
                <div>📝 {results.file1_metadata?.totalWords || 0} words</div>
                <div>💾 {results.file1_metadata?.fileSize ? `${(results.file1_metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '1.1rem' }}>
                📄 File 2: {file2Name || 'Document 2'}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                <div>📊 {results.file2_metadata?.totalPages || 0} pages</div>
                <div>📝 {results.file2_metadata?.totalWords || 0} words</div>
                <div>💾 {results.file2_metadata?.fileSize ? `${(results.file2_metadata.fileSize / 1024 / 1024).toFixed(1)}MB` : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Comparison Summary */}
          <div style={{
            background: results.similarity_score >= 90 ? '#f0fdf4' : 
                       results.similarity_score >= 70 ? '#fefce8' : '#fef2f2',
            border: `2px solid ${results.similarity_score >= 90 ? '#22c55e' : 
                                 results.similarity_score >= 70 ? '#eab308' : '#ef4444'}`,
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: results.similarity_score >= 90 ? '#166534' : 
                         results.similarity_score >= 70 ? '#a16207' : '#dc2626'
                }}>
                  {results.similarity_score || 0}%
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: results.similarity_score >= 90 ? '#166534' : 
                         results.similarity_score >= 70 ? '#a16207' : '#dc2626',
                  fontWeight: '600'
                }}>
                  Similarity Score
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                  <strong>📊 Comparison Summary:</strong>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  • <strong>{results.differences_found || 0}</strong> differences found<br/>
                  • <strong>{results.matches_found || 0}</strong> matching elements<br/>
                  • <strong>{results.page_differences?.length || 0}</strong> pages with changes<br/>
                  • <strong>{results.total_pages || 0}</strong> total pages compared
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                  <strong>🔄 Change Breakdown:</strong>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  • <span style={{ color: '#22c55e' }}>➕ {results.added_count || 0} added</span><br/>
                  • <span style={{ color: '#ef4444' }}>➖ {results.removed_count || 0} removed</span><br/>
                  • <span style={{ color: '#f59e0b' }}>✏️ {results.modified_count || 0} modified</span><br/>
                  • ⚡ Processed in {results.processing_time?.total_time_ms || 'N/A'}ms
                </div>
              </div>
            </div>
          </div>

          {/* Page Differences Section */}
          {results.page_differences && results.page_differences.length > 0 ? (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1f2937'
                }}>
                  📋 Page-by-Page Changes ({results.page_differences.length} pages affected)
                </h3>
                
                <button
                  onClick={toggleAllPages}
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  {expandedPages.size === results.page_differences.length ? '📕 Collapse All' : '📖 Expand All'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {results.page_differences.map((page, index) => (
                  <div
                    key={page.page_number}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Page Header */}
                    <div
                      onClick={() => togglePageExpansion(page.page_number)}
                      style={{
                        background: '#f8fafc',
                        padding: '15px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: expandedPages.has(page.page_number) ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <div>
                        <h4 style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          📄 Page {page.page_number}
                        </h4>
                        <p style={{
                          margin: '5px 0 0 0',
                          fontSize: '0.9rem',
                          color: '#6b7280'
                        }}>
                          {page.summary} • {page.page1_paragraphs || 0} → {page.page2_paragraphs || 0} paragraphs
                        </p>
                      </div>
                      
                      <div style={{
                        fontSize: '1.2rem',
                        transform: expandedPages.has(page.page_number) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}>
                        ⌄
                      </div>
                    </div>

                    {/* Page Details */}
                    {expandedPages.has(page.page_number) && (
                      <div style={{ padding: '20px' }}>
                        {results.text_changes
                          ?.filter(change => change.page === page.page_number)
                          ?.map((change, changeIndex) => (
                            <div
                              key={changeIndex}
                              style={{
                                background: getChangeBackground(change.type),
                                border: `1px solid ${getChangeColor(change.type)}`,
                                borderRadius: '6px',
                                padding: '15px',
                                marginBottom: changeIndex < results.text_changes.filter(c => c.page === page.page_number).length - 1 ? '12px' : '0'
                              }}
                            >
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '10px'
                              }}>
                                <span style={{
                                  background: getChangeColor(change.type),
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  textTransform: 'uppercase'
                                }}>
                                  {change.type}
                                </span>
                                <span style={{
                                  fontSize: '0.9rem',
                                  color: '#6b7280'
                                }}>
                                  Paragraph {change.paragraph}
                                </span>
                              </div>

                              {change.type === 'modified' ? (
                                <div style={{ fontSize: '0.9rem' }}>
                                  <div style={{
                                    background: '#fee2e2',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    marginBottom: '8px',
                                    border: '1px solid #fca5a5'
                                  }}>
                                    <strong style={{ color: '#dc2626' }}>❌ Original:</strong>
                                    <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                                      "{change.old_text}"
                                    </div>
                                  </div>
                                  <div style={{
                                    background: '#dcfce7',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #a7f3d0'
                                  }}>
                                    <strong style={{ color: '#166534' }}>✅ New:</strong>
                                    <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                                      "{change.new_text}"
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontFamily: 'monospace',
                                  lineHeight: '1.4',
                                  color: '#374151'
                                }}>
                                  "{change.text}"
                                </div>
                              )}
                            </div>
                          )) || (
                            <div style={{
                              padding: '20px',
                              textAlign: 'center',
                              color: '#6b7280',
                              fontStyle: 'italic'
                            }}>
                              No detailed changes available for this page
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #22c55e',
              borderRadius: '12px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#166534',
                margin: '0 0 10px 0'
              }}>
                Perfect Match!
              </h3>
              <p style={{
                margin: 0,
                color: '#166534',
                fontSize: '1rem'
              }}>
                No differences were found between the PDF documents. The content appears to be identical.
              </p>
            </div>
          )}

          {/* Word Count Analysis */}
          {results.word_changes && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '25px'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: '0 0 15px 0',
                color: '#1f2937'
              }}>
                📊 Word Count Analysis
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div>
                  <strong>File 1:</strong> {results.word_changes.file1_words} words
                </div>
                <div>
                  <strong>File 2:</strong> {results.word_changes.file2_words} words
                </div>
                <div>
                  <strong>Difference:</strong> {results.word_changes.word_difference} words
                </div>
                <div>
                  <strong>Change:</strong> {results.word_changes.word_change_percentage}%
                </div>
              </div>
            </div>
          )}

          {/* Processing Information */}
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '15px',
            marginTop: '20px',
            fontSize: '0.85rem',
            color: '#6b7280'
          }}>
            <strong>Processing Info:</strong> {results.processing_note || 'PDF comparison completed'} •
            Quality: {Math.round((results.quality_metrics?.overall_success_rate || 1) * 100)}% •
            Time: {results.processing_time?.total_time_ms || 'N/A'}ms •
            Type: {results.comparison_type || 'PDF Document'}
          </div>
        </>
      ) : (
        /* SIDE-BY-SIDE VIEW - Built-in implementation with filtering & sync scrolling */
        <div>
          {/* Side-by-Side Controls */}
          <div style={{
            background: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                📄 Side-by-Side Document Comparison
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <input
                  type="text"
                  placeholder="Search in documents..."
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                    minWidth: '200px'
                  }}
                  onChange={(e) => {
                    // Simple search implementation
                    const searchTerm = e.target.value.toLowerCase();
                    const highlights = document.querySelectorAll('.side-by-side-highlight');
                    highlights.forEach(h => {
                      h.style.background = '';
                      h.style.fontWeight = '';
                      h.classList.remove('side-by-side-highlight');
                    });
                    
                    if (searchTerm.trim()) {
                      const textElements = document.querySelectorAll('.side-by-side-paragraph');
                      textElements.forEach(el => {
                        if (el.textContent.toLowerCase().includes(searchTerm)) {
                          el.style.background = '#fbbf24';
                          el.style.fontWeight = 'bold';
                          el.classList.add('side-by-side-highlight');
                        }
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#dcfce7',
                border: '1px solid #166534',
                borderRadius: '3px'
              }}></div>
              <span>Added</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#fee2e2',
                border: '1px solid #dc2626',
                borderRadius: '3px'
              }}></div>
              <span>Removed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                background: '#fef3c7',
                border: '1px solid #d97706',
                borderRadius: '3px'
              }}></div>
              <span>Modified</span>
            </div>
          </div>

          {/* Side-by-Side Document Panels */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              height: '600px'
            }}
          >
            {/* Document 1 Panel */}
            <div 
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <div style={{
                background: '#f8fafc',
                padding: '15px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#1f2937'
              }}>
                📄 {file1Name || 'Document 1'}
              </div>
              <div 
                id="sideBySideDoc1"
                style={{
                  height: 'calc(600px - 60px)',
                  overflowY: 'auto',
                  padding: '20px'
                }}
              >
                {(results.file1_pages || []).map(page => {
                  return (
                    <div key={page.page_number} style={{ marginBottom: '30px' }}>
                      <div style={{
                        background: '#f3f4f6',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        marginBottom: '15px',
                        fontSize: '0.9rem',
                        color: '#374151'
                      }}>
                        Page {page.page_number}
                      </div>
                      {(page.paragraphs || []).map((para, index) => {
                        const change = (results.text_changes || []).find(c => 
                          c.page === page.page_number && c.paragraph === index
                        );
                        
                        let style = {
                          marginBottom: '12px',
                          padding: '8px 0',
                          lineHeight: '1.6',
                          color: '#374151'
                        };

                        if (change) {
                          switch (change.type) {
                            case 'added':
                              style = {
                                ...style,
                                background: '#dcfce7',
                                border: '1px solid #166534',
                                color: '#166534',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                              };
                              break;
                            case 'removed':
                              style = {
                                ...style,
                                background: '#fee2e2',
                                border: '1px solid #dc2626',
                                color: '#dc2626',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                              };
                              break;
                            case 'modified':
                              style = {
                                ...style,
                                background: '#fef3c7',
                                border: '1px solid #d97706',
                                color: '#92400e',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                              };
                              break;
                          }
                        }

                        return (
                          <div 
                            key={index} 
                            className="side-by-side-paragraph"
                            style={style}
                          >
                            {para.text}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document 2 Panel */}
            <div 
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <div style={{
                background: '#f8fafc',
                padding: '15px 20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '1.1rem',
                color: '#1f2937'
              }}>
                📄 {file2Name || 'Document 2'}
              </div>
              <div 
                id="sideBySideDoc2"
                style={{
                  height: 'calc(600px - 60px)',
                  overflowY: 'auto',
                  padding: '20px'
                }}
              >
                {(results.file2_pages || []).map(page => {
                  return (
                    <div key={page.page_number} style={{ marginBottom: '30px' }}>
                      <div style={{
                        background: '#f3f4f6',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        marginBottom: '15px',
                        fontSize: '0.9rem',
                        color: '#374151'
                      }}>
                        Page {page.page_number}
                      </div>
                      {(page.paragraphs || []).map((para, index) => {
                        const change = (results.text_changes || []).find(c => 
                          c.page === page.page_number && c.paragraph === index
                        );
                        
                        let style = {
                          marginBottom: '12px',
                          padding: '8px 0',
                          lineHeight: '1.6',
                          color: '#374151'
                        };

                        if (change) {
                          switch (change.type) {
                            case 'added':
                              style = {
                                ...style,
                                background: '#dcfce7',
                                border: '1px solid #166534',
                                color: '#166534',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                              };
                              break;
                            case 'removed':
                              style = {
                                ...style,
                                background: '#fee2e2',
                                border: '1px solid #dc2626',
                                color: '#dc2626',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                              };
                              break;
                            case 'modified':
                              style = {
                                ...style,
                                background: '#fef3c7',
                                border: '1px solid #d97706',
                                color: '#92400e',
                                padding: '10px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                              };
                              break;
                          }
                        }

                        return (
                          <div 
                            key={index} 
                            className="side-by-side-paragraph"
                            style={style}
                          >
                            {para.text}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PdfResults;
