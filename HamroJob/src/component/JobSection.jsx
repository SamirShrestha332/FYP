import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navigation from './Navigation'; // Import the Navigation component
import './JobSection.css'; // We'll create a dedicated CSS file for job section

function JobSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const jobsPerPage = 6;
  
  // Parse search query from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is logged in
        const userString = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const loginStatus = localStorage.getItem('isLoggedIn');
        
        if (userString && token && loginStatus === 'true') {
          const userData = JSON.parse(userString);
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
        
        // Fetch jobs from the API (don't require authentication)
        try {
          const response = await axios.get('http://localhost:5000/api/jobs');
          
          if (response.data && response.data.jobs) {
            setJobs(response.data.jobs);
          } else {
            setJobs([]);
          }
        } catch (serverError) {
          console.error('Error fetching jobs from server:', serverError);
          setError('Failed to fetch jobs. Please try again later.');
        } finally {
          setLoading(false);
        }
        
      } catch (err) {
        console.error('Error loading data:', err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Apply search and filters to jobs whenever jobs, searchTerm or activeFilter changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [jobs, searchTerm, activeFilter, sortBy]);

  const applyFiltersAndSearch = () => {
    if (!jobs || jobs.length === 0) {
      setFilteredJobs([]);
      return;
    }
    
    let results = [...jobs];
    
    // Apply location/category filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'recent') {
        // Show jobs posted in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        results = results.filter(job => {
          const jobDate = new Date(job.created_at);
          return jobDate >= oneWeekAgo;
        });
      } else {
        results = results.filter(job => 
          job.location.toLowerCase().includes(activeFilter.toLowerCase())
        );
      }
    }
    
    // Apply search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(job => 
        job.title.toLowerCase().includes(searchLower) || 
        job.company.toLowerCase().includes(searchLower) || 
        (job.description && job.description.toLowerCase().includes(searchLower)) ||
        (job.requirements && job.requirements.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    results = sortJobs(results, sortBy);
    
    setFilteredJobs(results);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const sortJobs = (jobsToSort, sortingOption) => {
    switch (sortingOption) {
      case 'newest':
        return [...jobsToSort].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return [...jobsToSort].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'a-z':
        return [...jobsToSort].sort((a, b) => a.title.localeCompare(b.title));
      case 'z-a':
        return [...jobsToSort].sort((a, b) => b.title.localeCompare(a.title));
      default:
        return jobsToSort;
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFiltersAndSearch();
    
    // Update URL with search term
    if (searchTerm) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (option) => {
    setSortBy(option);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSortBy('newest');
    navigate('/jobs');
  };

  // Calculate pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading jobs...</p>
    </div>
  );
  
  return (
    <div className="job-section-container">
      {/* Use the Navigation component instead of inline navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="job-hero">
        <h1>Find your Job</h1>
        <p>Explore all available job opportunities. Find the perfect match for your skills and career goals.</p>
        
        {/* Search Form */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-container">
            <div className="search-input-wrapper">
              <ion-icon name="briefcase-outline"></ion-icon>
              <input 
                type="text" 
                placeholder="Search job titles, companies, or keywords..." 
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
      
      {/* Filters & Results Section */}
      <div className="job-content">
        <div className="filters-container">
          <div className="filter-header">
            <h2>Filter Jobs</h2>
            {(activeFilter !== 'all' || searchTerm || sortBy !== 'newest') && (
              <button className="clear-filters" onClick={handleClearFilters}>
                Clear All
              </button>
            )}
          </div>
          
          {/* Category Filters */}
          <div className="filter-group">
            <h3>Categories</h3>
            <div className="filter-options">
              <button 
                className={activeFilter === 'all' ? 'active-filter' : 'filter-button'} 
                onClick={() => handleFilterChange('all')}
              >
                All Jobs
              </button>
              <button 
                className={activeFilter === 'recent' ? 'active-filter' : 'filter-button'} 
                onClick={() => handleFilterChange('recent')}
              >
                Recent
              </button>
              <button 
                className={activeFilter === 'kathmandu' ? 'active-filter' : 'filter-button'} 
                onClick={() => handleFilterChange('kathmandu')}
              >
                Kathmandu
              </button>
              <button 
                className={activeFilter === 'remote' ? 'active-filter' : 'filter-button'} 
                onClick={() => handleFilterChange('remote')}
              >
                Remote
              </button>
            </div>
          </div>
          
          {/* Sort By Dropdown - Now Always Visible */}
          <div className="filter-group">
            <h3>Sort By</h3>
            <div className="sort-dropdown">
              <div className="sort-label">
                {sortBy === 'newest' ? 'Newest' : 
                 sortBy === 'oldest' ? 'Oldest' : 
                 sortBy === 'a-z' ? 'Title (A-Z)' : 'Title (Z-A)'}
              </div>
              
              {/* Always show sort options (no conditional rendering) */}
              <div className="sort-options">
                <div 
                  className={sortBy === 'newest' ? 'active' : ''} 
                  onClick={() => handleSortChange('newest')}
                >
                  Newest
                </div>
                <div 
                  className={sortBy === 'oldest' ? 'active' : ''} 
                  onClick={() => handleSortChange('oldest')}
                >
                  Oldest
                </div>
                <div 
                  className={sortBy === 'a-z' ? 'active' : ''} 
                  onClick={() => handleSortChange('a-z')}
                >
                  Title (A-Z)
                </div>
                <div 
                  className={sortBy === 'z-a' ? 'active' : ''} 
                  onClick={() => handleSortChange('z-a')}
                >
                  Title (Z-A)
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="results-container">
          <div className="results-header">
            <h2>
              {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
              {searchTerm && <span> for "{searchTerm}"</span>}
              {activeFilter !== 'all' && 
               <span> in {activeFilter === 'recent' ? 'the last 7 days' : activeFilter}</span>}
            </h2>
          </div>
          
          {/* Job Cards */}
          <div className="job-grid">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => (
                <div className="job-card" key={job.id} onClick={() => navigate(`/job/${job.id}`)}>
                  <div className="job-card-header">
                    <div className="company-logo">
                      <img src="/src/assets/Companylogo.png" alt={job.company} />
                    </div>
                    <div className="job-type">
                      {job.job_type || 'Full-time'}
                    </div>
                  </div>
                  <div className="job-card-body">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.company}</p>
                    <div className="job-meta">
                      <div className="job-location">
                        <ion-icon name="location-outline"></ion-icon>
                        <span>{job.location}</span>
                      </div>
                      <div className="job-date">
                        <ion-icon name="calendar-outline"></ion-icon>
                        <span>{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="job-card-footer">
                    <button className="view-job-btn">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-jobs-found">
                <ion-icon name="search-outline"></ion-icon>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button onClick={handleClearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredJobs.length > jobsPerPage && (
            <div className="pagination">
              <button 
                className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ion-icon name="chevron-back-outline"></ion-icon>
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                // Show limited page numbers with ellipsis
                const pageNum = index + 1;
                
                // Always show first page, last page, current page, and one page before and after current
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button 
                      key={pageNum} 
                      className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                
                // Show ellipsis but avoid duplicates
                if (
                  (pageNum === 2 && currentPage > 3) || 
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={pageNum} className="pagination-ellipsis">...</span>;
                }
                
                return null;
              })}
              
              <button 
                className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="job-section-footer">
        <p>&copy; {new Date().getFullYear()} HamroJob. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default JobSection;
