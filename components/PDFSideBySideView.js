import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const PDFSideBySideView = ({ results, file1Name, file2Name }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [screenSize, setScreenSize] = useState('desktop');
  
  // Filter states
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [pageRangeStart, setPageRangeStart] = useState(1);
  const [pageRangeEnd, setPageRangeEnd] = useState(1);
  const [activeChangeTypes, setActiveChangeTypes] = useState({
    added: true,
    removed: true,
    modified: true,
    unchanged: true
  });
  const [searchText, setSearchText] = useState('');
  const [loadingMode, setLoadingMode] = useState('virtual'); // 'virtual' or 'all'
  const [currentPageBatch, setCurrentPageBatch] = useState(15);
  
  // Scroll synchronization refs
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const isSyncingScroll = useRef(false);
  
  const allChanges = results?.text_changes || [];
  const totalPages = Math.max(results?.file1_pages?.length || 0, results?.file2_pages?.length || 0);
  const pageSize = 15; // Pages per batch in virtual mode

  // Initialize page range when results change
  useEffect(() => {
    if (totalPages > 0) {
      setPageRangeEnd(totalPages);
      setCurrentPageBatch(Math.min(pageSize, totalPages));
    }
  }, [totalPages]);

  // Detect screen size
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Synchronized scrolling for desktop mode
  const handleScroll = useCallback((sourcePanel, targetPanelRef) => {
    if (isSyncingScroll.current || screenSize !== 'desktop') return;
    
    isSyncingScroll.current = true;
    
    const sourceElement = sourcePanel.target;
    const targetElement = targetPanelRef.current;
    
    if (targetElement && sourceElement) {
      const sourceScrollRatio = sourceElement.scrollTop / (sourceElement.scrollHeight - sourceElement.clientHeight);
      const targetScrollTop = sourceScrollRatio * (targetElement.scrollHeight - targetElement.clientHeight);
      
      targetElement.scrollTop = targetScrollTop;
    }
    
    // Reset sync flag after a short delay
    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 10);
  }, [screenSize]);

  // Debounced search
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Filter and pagination logic
  const filteredData = useMemo(() => {
    const file1Pages = results?.file1_pages || [];
    const file2Pages = results?.file2_pages || [];
    
    // Apply page range filter
    const startIdx = pageRangeStart - 1;
    const endIdx = pageRangeEnd;
    
    const filterPages = (pages) => {
      return pages.slice(startIdx, endIdx).filter(page => {
        // Apply search filter
        if (debouncedSearchText.trim()) {
          const searchLower = debouncedSearchText.toLowerCase();
          const hasSearchText = page.paragraphs.some(para => 
            para.text.toLowerCase().includes(searchLower)
          );
          if (!hasSearchText) return false;
        }
        
        // Apply change type filter (for mobile, only filter active tab)
        if (screenSize === 'mobile') {
          return true; // We'll handle change type filtering in paragraph rendering
        }
        
        // Check if page has relevant changes for desktop/tablet
        const pageHasRelevantChanges = page.paragraphs.some((para, paraIndex) => {
          const change = findParagraphChange(page.page_number, paraIndex, pages === file1Pages ? 1 : 2);
          if (!change) return activeChangeTypes.unchanged;
          return activeChangeTypes[change.type];
        });
        
        return pageHasRelevantChanges;
      });
    };
    
    // Apply virtual loading limit
    const applyVirtualLimit = (pages) => {
      if (loadingMode === 'virtual') {
        return pages.slice(0, currentPageBatch);
      }
      return pages;
    };
    
    return {
      file1: applyVirtualLimit(filterPages(file1Pages)),
      file2: applyVirtualLimit(filterPages(file2Pages))
    };
  }, [results, pageRangeStart, pageRangeEnd, debouncedSearchText, activeChangeTypes, loadingMode, currentPageBatch, screenSize]);

  const findParagraphChange = (pageNumber, paragraphIndex, fileNumber) => {
    return allChanges.find(change => 
      change.page === pageNumber && 
      change.paragraph === paragraphIndex &&
      (change.file === `file${fileNumber}` || change.file === 'both')
    );
  };

  const getHighlightStyle = (changeType, isFiltered = false) => {
    // If change type is filtered out, show as dimmed
    if (isFiltered) {
      return {
        padding: '4px 0',
        color: '#9ca3af',
        opacity: 0.5
      };
    }
    
    if (changeType === 'added') {
      return {
        background: '#dcfce7',
        border: '1px solid #166534',
        color: '#166534',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: '500'
      };
    }
    if (changeType === 'removed') {
      return {
        background: '#fee2e2',
        border: '1px solid #dc2626',
        color: '#dc2626',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: '500'
      };
    }
    if (changeType === 'modified') {
      return {
        background: '#fef3c7',
        border: '1px solid #d97706',
        color: '#92400e',
        padding: '8px 12px',
        borderRadius: '6px',
        fontWeight: '500'
      };
    }
    return {
      padding: '4px 0',
      color: '#374151'
    };
  };

  // Highlight search text
  const highlightSearchText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} style={{ background: '#fbbf24', fontWeight: 'bold' }}>{part}</span> : 
        part
    );
  };

  const renderFilterControls = () => {
    if (!filtersVisible) return null;
    
    return (
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: screenSize === 'mobile' ? '15px' : '20px',
        marginBottom: '20px'
      }}>
        {/* Page Range Controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>📄 Pages:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageRangeStart}
              onChange={(e) => setPageRangeStart(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '60px',
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
            <span>to</span>
            <input
              type="number"
              min={pageRangeStart}
              max={totalPages}
              value={pageRangeEnd}
              onChange={(e) => setPageRangeEnd(Math.min(totalPages, parseInt(e.target.value) || totalPages))}
              style={{
                width: '60px',
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>of {totalPages}</span>
          </div>
          
          {/* Loading Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>📋 Load:</span>
            <button
              onClick={() => setLoadingMode(loadingMode === 'virtual' ? 'all' : 'virtual')}
              style={{
                background: loadingMode === 'virtual' ? '#3b82f6' : '#6b7280',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {loadingMode === 'virtual' ? `${currentPageBatch} pages` : 'All pages'}
            </button>
          </div>
        </div>

        {/* Change Type Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>🎯 Changes:</span>
          {[
            { key: 'added', label: 'Added', color: '#166534' },
            { key: 'removed', label: 'Removed', color: '#dc2626' },
            { key: 'modified', label: 'Modified', color: '#d97706' },
            { key: 'unchanged', label: 'Unchanged', color: '#6b7280' }
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setActiveChangeTypes(prev => ({ ...prev, [key]: !prev[key] }))}
              style={{
                background: activeChangeTypes[key] ? color : '#f3f4f6',
                color: activeChangeTypes[key] ? 'white' : '#6b7280',
                border: `1px solid ${color}`,
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {activeChangeTypes[key] ? '✓' : '○'} {label}
            </button>
          ))}
        </div>

        {/* Search and Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>🔍</span>
            <input
              type="text"
              placeholder="Search text in documents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
          </div>
          
          <button
            onClick={() => {
              setPageRangeStart(1);
              setPageRangeEnd(totalPages);
              setActiveChangeTypes({ added: true, removed: true, modified: true, unchanged: true });
              setSearchText('');
              setLoadingMode('virtual');
              setCurrentPageBatch(Math.min(pageSize, totalPages));
            }}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>

        {/* Virtual Loading Controls */}
        {loadingMode === 'virtual' && currentPageBatch < (pageRangeEnd - pageRangeStart + 1) && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#eff6ff',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#1e40af', marginRight: '10px' }}>
              Showing {currentPageBatch} of {pageRangeEnd - pageRangeStart + 1} pages
            </span>
            <button
              onClick={() => setCurrentPageBatch(prev => Math.min(prev + pageSize, pageRangeEnd - pageRangeStart + 1))}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Load More
            </button>
            <button
              onClick={() => setLoadingMode('all')}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Load All
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderDocument = (pages, fileName, fileNumber) => {
    const isActiveTab = screenSize !== 'mobile' || activeTab === fileNumber;
    
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        height: screenSize === 'mobile' ? 'auto' : '700px'
      }}>
        <div style={{
          background: '#f8fafc',
          padding: '15px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          fontSize: screenSize === 'mobile' ? '0.95rem' : '1rem'
        }}>
          📄 {fileName || `Document ${fileNumber}`}
          <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '10px' }}>
            ({pages.length} pages shown)
          </span>
        </div>
        
        <div 
          ref={fileNumber === 1 ? leftPanelRef : rightPanelRef}
          onScroll={(e) => {
            if (fileNumber === 1) {
              handleScroll(e, rightPanelRef);
            } else {
              handleScroll(e, leftPanelRef);
            }
          }}
          style={{
            height: screenSize === 'mobile' ? '400px' : '600px',
            overflowY: 'auto',
            padding: screenSize === 'mobile' ? '15px' : '20px',
            fontSize: screenSize === 'mobile' ? '0.85rem' : '0.9rem',
            lineHeight: '1.6'
          }}
        >
          {pages.map((page) => (
            <div key={page.page_number} style={{ marginBottom: '30px' }}>
              <div style={{
                background: '#f3f4f6',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Page {page.page_number}
              </div>
              
              {page.paragraphs.map((para, paraIndex) => {
                const change = findParagraphChange(page.page_number, paraIndex, fileNumber);
                const changeType = change?.type;
                
                // For mobile, apply change type filter only to active tab
                const isChangeTypeFiltered = screenSize === 'mobile' ? 
                  (isActiveTab && changeType && !activeChangeTypes[changeType]) :
                  (changeType && !activeChangeTypes[changeType]) || (!changeType && !activeChangeTypes.unchanged);
                
                const style = getHighlightStyle(changeType, isChangeTypeFiltered);
                
                return (
                  <div key={paraIndex} style={{ marginBottom: '12px', ...style }}>
                    {highlightSearchText(para.text, debouncedSearchText)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: '#f8fafc',
        padding: screenSize === 'mobile' ? '12px' : '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ 
            margin: 0,
            fontSize: screenSize === 'mobile' ? '1.1rem' : '1.3rem'
          }}>
            📄 Side-by-Side Document Comparison
          </h3>
          <button
            onClick={() => setFiltersVisible(!filtersVisible)}
            style={{
              background: filtersVisible ? '#3b82f6' : '#6b7280',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔍 Filters {filtersVisible ? '▼' : '▶'}
          </button>
        </div>
        <p style={{ 
          margin: 0, 
          color: '#6b7280',
          fontSize: screenSize === 'mobile' ? '0.85rem' : '0.95rem'
        }}>
          <strong>{allChanges.length} changes found</strong> • {results?.similarity_score || 0}% similarity
        </p>
      </div>

      {/* Filter Controls */}
      {renderFilterControls()}

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: screenSize === 'mobile' ? '12px' : '20px',
        marginBottom: '20px',
        fontSize: screenSize === 'mobile' ? '0.8rem' : '0.85rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: screenSize === 'mobile' ? '12px' : '16px', 
            height: screenSize === 'mobile' ? '12px' : '16px', 
            background: '#dcfce7', 
            border: '1px solid #166534',
            borderRadius: '3px' 
          }}></div>
          <span>Added</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: screenSize === 'mobile' ? '12px' : '16px', 
            height: screenSize === 'mobile' ? '12px' : '16px', 
            background: '#fee2e2', 
            border: '1px solid #dc2626',
            borderRadius: '3px' 
          }}></div>
          <span>Removed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: screenSize === 'mobile' ? '12px' : '16px', 
            height: screenSize === 'mobile' ? '12px' : '16px', 
            background: '#fef3c7', 
            border: '1px solid #d97706',
            borderRadius: '3px' 
          }}></div>
          <span>Modified</span>
        </div>
      </div>

      {/* Mobile: Tab View */}
      {screenSize === 'mobile' && (
        <div>
          {/* Tab Buttons */}
          <div style={{
            display: 'flex',
            background: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveTab(1)}
              style={{
                flex: 1,
                background: activeTab === 1 ? 'white' : 'transparent',
                border: 'none',
                padding: '12px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 1 ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📄 {file1Name ? file1Name.substring(0, 20) + '...' : 'Document 1'}
            </button>
            <button
              onClick={() => setActiveTab(2)}
              style={{
                flex: 1,
                background: activeTab === 2 ? 'white' : 'transparent',
                border: 'none',
                padding: '12px 8px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 2 ? '#2563eb' : '#6b7280',
                boxShadow: activeTab === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📄 {file2Name ? file2Name.substring(0, 20) + '...' : 'Document 2'}
            </button>
          </div>

          {/* Single Document View */}
          {activeTab === 1 ? 
            renderDocument(filteredData.file1, file1Name, 1) :
            renderDocument(filteredData.file2, file2Name, 2)
          }
        </div>
      )}

      {/* Tablet: Stacked View */}
      {screenSize === 'tablet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {renderDocument(filteredData.file1, file1Name, 1)}
          {renderDocument(filteredData.file2, file2Name, 2)}
        </div>
      )}

      {/* Desktop: Side-by-Side View */}
      {screenSize === 'desktop' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            {renderDocument(filteredData.file1, file1Name, 1)}
          </div>
          <div style={{ flex: 1 }}>
            {renderDocument(filteredData.file2, file2Name, 2)}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        background: '#f9fafb',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: screenSize === 'mobile' ? '0.8rem' : '0.9rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        {allChanges.length > 0 ? (
          <span>
            <strong>{allChanges.length} changes highlighted</strong> across {results?.total_pages || 0} pages
            {screenSize === 'mobile' && <span><br />Swipe between tabs to compare documents</span>}
            {loadingMode === 'virtual' && (
              <span><br />Virtual loading active - showing {currentPageBatch} pages for faster performance</span>
            )}
          </span>
        ) : (
          <span>
            <strong>No changes detected</strong> - Documents appear to be identical
          </span>
        )}
      </div>
    </div>
  );
};

export default PDFSideBySideView;
