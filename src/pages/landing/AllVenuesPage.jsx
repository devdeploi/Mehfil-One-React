import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/function';
import Navbar from '../../components/Navbar';
import Footer from './components/Footer';
import { FaUsers, FaMapMarkerAlt, FaRupeeSign, FaStar, FaChevronRight, FaSearch, FaFilter, FaChevronLeft, FaSnowflake, FaTimes } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';

const AllVenuesPage = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalMahals, setTotalMahals] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        mahalName: '',
        city: '',
        minPrice: '',
        maxPrice: '',
        minRating: '',
        isAC: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVenues();
        }, 300);
        return () => clearTimeout(timer);
    }, [currentPage, filters]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 12,
                ...filters
            };
            const response = await axios.get(`${API_URL}/mahals`, { params });
            setVenues(response.data.mahals || []);
            setTotalPages(response.data.totalPages);
            setTotalMahals(response.data.totalMahals);
        } catch (error) {
            console.error("Error fetching venues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setFilters({
            mahalName: '',
            city: '',
            minPrice: '',
            maxPrice: '',
            minRating: '',
            isAC: ''
        });
        setCurrentPage(1);
    };

    const handleOpenDetail = (venue) => {
        navigate(`/venue/${venue._id}`);
    };

    return (
        <div className="all-venues-container" style={{ background: '#f8f9fa', minHeight: '100vh', position: 'relative' }}>
            <Navbar />
            
            {/* Header Section */}
            <div className="all-venues-header py-5" style={{ background: 'linear-gradient(135deg, #111 0%, #333 100%)', color: '#fff', marginTop: '70px' }}>
                <div className="container py-4 text-center text-md-start">
                    <h1 className="display-4 fw-bold mb-2 animate-fade-in">All Wedding Halls</h1>
                    <p className="lead opacity-75 mb-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>Find the perfect venue for your special day.</p>
                </div>
            </div>

            {/* Sticky Filter & Page Controls */}
            <div className="sticky-controls-bar py-2 shadow-sm" style={{ 
                position: 'sticky', 
                top: '60px', 
                zIndex: 1020, 
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        {/* Left Side: Venue Count */}
                        <div className="d-none d-md-block">
                            <span className="small fw-bold text-muted text-uppercase tracking-wider">
                                {totalMahals} {totalMahals === 1 ? 'Venue' : 'Venues'} Found
                            </span>
                        </div>

                        {/* Right Side: Filter Button */}
                        <div className="ms-auto">
                            <button 
                                className="btn btn-dark rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2 border-0"
                                onClick={() => setShowFilters(true)}
                                style={{ 
                                    background: 'linear-gradient(45deg, #1a1a1a, #333)',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FaFilter size={12} className="text-danger" />
                                <span>Filter Options</span>
                                {Object.values(filters).some(x => x !== '') && (
                                    <span className="badge bg-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px', fontSize: '0.55rem', padding: 0 }}>
                                        {Object.values(filters).filter(x => x !== '').length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Drawer / Sidebar Slider */}
            <div className={`filter-sidebar-overlay ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(false)}></div>
            <div className={`filter-sidebar-slider ${showFilters ? 'open' : ''}`}>
                <div className="filter-sidebar-header p-4 d-flex justify-content-between align-items-center border-bottom">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <FaFilter className="text-danger" /> Filter Venues
                    </h5>
                    <button className="btn btn-link p-0 text-dark" onClick={() => setShowFilters(false)}>
                        <FaTimes size={24} />
                    </button>
                </div>
                
                <div className="filter-sidebar-body p-4">
                    {/* Search Section */}
                    <div className="filter-section mb-4">
                        <label className="form-label x-small fw-bold text-muted text-uppercase mb-3 d-block" style={{ letterSpacing: '2px' }}>Discovery Hub</label>
                        <div className="d-flex flex-column gap-3">
                            {/* Venue Name High-End Input */}
                            <div className="search-box-premium position-relative overflow-visible">
                                <div className="premium-input-container p-1 bg-white border rounded-4 shadow-sm transition-all" style={{ border: '1.5px solid #eee' }}>
                                    <div className="d-flex align-items-center px-3 py-2">
                                        <div className="search-icon-wrapper position-relative me-3">
                                            <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                <FaSearch className="text-danger" size={14} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <span className="x-small text-muted fw-bold d-block mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>FIND VENUE</span>
                                            <input 
                                                type="text" 
                                                className="form-control border-0 p-0 bg-transparent shadow-none" 
                                                placeholder="Search by name..." 
                                                value={filters.mahalName}
                                                onFocus={() => setShowNameSuggestions(true)}
                                                onChange={(e) => { setFilters({...filters, mahalName: e.target.value}); setCurrentPage(1); setShowNameSuggestions(true); }}
                                                style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111' }}
                                            />
                                        </div>
                                        {filters.mahalName && (
                                            <button className="btn btn-link p-0 text-muted hover-text-danger transition-all" onClick={() => { setFilters({...filters, mahalName: ''}); setCurrentPage(1); setShowNameSuggestions(false); }}>
                                                <FaTimes size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {showNameSuggestions && filters.mahalName && venues.length > 0 && (
                                    <div className="search-results-premium shadow-lg rounded-4 mt-2 py-2 bg-white bg-opacity-95 border position-absolute w-100 animate-fade-in" style={{ zIndex: 1000, top: '100%', backdropFilter: 'blur(10px)' }}>
                                        <div className="px-3 py-1 x-small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Top Matches</div>
                                        {venues.slice(0, 4).map(v => (
                                            <div 
                                                key={v._id} 
                                                className="result-item px-3 py-2 d-flex align-items-center gap-3 transition-all hover-bg-light-danger cursor-pointer"
                                                onClick={() => { setFilters({...filters, mahalName: v.mahalName}); setCurrentPage(1); setShowNameSuggestions(false); }}
                                            >
                                                <div className="result-img rounded-3 overflow-hidden border" style={{ width: '36px', height: '36px' }}>
                                                    <img src={`${API_URL.replace('/api', '')}/${v.coverImage}`} className="w-100 h-100 object-fit-cover" alt="" />
                                                </div>
                                                <div className="result-info flex-grow-1">
                                                    <div className="fw-bold small text-dark mb-0">{v.mahalName}</div>
                                                    <div className="x-small text-muted d-flex align-items-center gap-1">
                                                        <FaMapMarkerAlt size={8} /> {v.city}
                                                    </div>
                                                </div>
                                                <FaChevronRight size={10} className="text-muted opacity-50" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Location High-End Input */}
                            <div className="search-box-premium position-relative overflow-visible">
                                <div className="premium-input-container p-1 bg-white border rounded-4 shadow-sm transition-all" style={{ border: '1.5px solid #eee' }}>
                                    <div className="d-flex align-items-center px-3 py-2">
                                        <div className="search-icon-wrapper position-relative me-3">
                                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                <FaMapMarkerAlt className="text-primary" size={14} />
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <span className="x-small text-muted fw-bold d-block mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>WHERE</span>
                                            <input 
                                                type="text" 
                                                className="form-control border-0 p-0 bg-transparent shadow-none" 
                                                placeholder="City or area..." 
                                                value={filters.city}
                                                onFocus={() => setShowCitySuggestions(true)}
                                                onChange={(e) => { setFilters({...filters, city: e.target.value}); setCurrentPage(1); setShowCitySuggestions(true); }}
                                                style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111' }}
                                            />
                                        </div>
                                        {filters.city && (
                                            <button className="btn btn-link p-0 text-muted hover-text-primary transition-all" onClick={() => { setFilters({...filters, city: ''}); setCurrentPage(1); setShowCitySuggestions(false); }}>
                                                <FaTimes size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {showCitySuggestions && filters.city && venues.length > 0 && (
                                    <div className="search-results-premium shadow-lg rounded-4 mt-2 py-2 bg-white bg-opacity-95 border position-absolute w-100 animate-fade-in" style={{ zIndex: 1000, top: '100%', backdropFilter: 'blur(10px)' }}>
                                        <div className="px-3 py-1 x-small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>Areas Found</div>
                                        {[...new Set(venues.map(v => v.city))].slice(0, 4).map(city => (
                                            <div 
                                                key={city} 
                                                className="result-item px-3 py-2 d-flex align-items-center gap-3 transition-all hover-bg-light-primary cursor-pointer"
                                                onClick={() => { setFilters({...filters, city: city}); setCurrentPage(1); setShowCitySuggestions(false); }}
                                            >
                                                <div className="result-icon-bg bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                                    <FaMapMarkerAlt size={14} className="text-primary opacity-50" />
                                                </div>
                                                <div className="result-info flex-grow-1">
                                                    <div className="fw-bold small text-dark mb-0">{city}</div>
                                                    <div className="x-small text-muted">All available venues in this area</div>
                                                </div>
                                                <FaChevronRight size={10} className="text-muted opacity-50" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price Section */}
                    <div className="filter-section mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <label className="form-label x-small fw-bold text-muted text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Budget Range</label>
                            <span className="badge bg-light text-dark border px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                ₹{filters.minPrice || 0} - {filters.maxPrice ? `₹${filters.maxPrice}` : 'Any'}
                            </span>
                        </div>

                        {/* Premium Range Slider */}
                        <div className="px-2 mb-4">
                            <input 
                                type="range" 
                                className="form-range custom-range-premium" 
                                min="0" 
                                max="200000" 
                                step="5000"
                                value={filters.maxPrice || 200000}
                                onChange={(e) => { setFilters({...filters, maxPrice: e.target.value}); setCurrentPage(1); }}
                            />
                            <div className="d-flex justify-content-between x-small text-muted fw-bold mt-1">
                                <span>₹0</span>
                                <span>₹2L+</span>
                            </div>
                        </div>

                        {/* Budget Quick Presets */}
                        <div className="d-flex flex-wrap gap-2">
                            {[
                                { label: 'Under 25K', min: '0', max: '25000' },
                                { label: '25K - 50K', min: '25000', max: '50000' },
                                { label: '50K - 1L', min: '50000', max: '100000' },
                                { label: 'Luxury (1L+)', min: '100000', max: '' }
                            ].map((preset) => (
                                <button 
                                    key={preset.label}
                                    className={`btn btn-sm rounded-pill px-3 py-2 fw-bold flex-grow-1 border transition-all ${filters.maxPrice === preset.max && filters.minPrice === preset.min ? 'btn-dark border-dark shadow-sm' : 'btn-light border-light-subtle'}`}
                                    onClick={() => { setFilters({...filters, minPrice: preset.min, maxPrice: preset.max}); setCurrentPage(1); }}
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="filter-section mb-4">
                        <label className="form-label x-small fw-bold text-muted text-uppercase mb-2">Minimum Rating</label>
                        <div className="d-flex gap-2 flex-wrap">
                            {['', '4', '3', '2'].map((val) => (
                                <button 
                                    key={val}
                                    className={`btn btn-sm rounded-pill px-3 py-2 fw-bold flex-grow-1 border transition-all ${filters.minRating === val ? 'btn-danger border-danger shadow-sm' : 'btn-light border-light-subtle'}`}
                                    onClick={() => { setFilters({...filters, minRating: val}); setCurrentPage(1); }}
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    {val === '' ? 'All' : (
                                        <div className="d-flex align-items-center justify-content-center gap-1">
                                            {val}<FaStar size={10} className={filters.minRating === val ? 'text-white' : 'text-warning'} />+
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AC Section */}
                    <div className="filter-section mb-5">
                        <label className="form-label x-small fw-bold text-muted text-uppercase mb-3 d-block" style={{ letterSpacing: '1px' }}>Hall Facilities</label>
                        <div className="d-flex gap-2">
                            <button 
                                className={`btn btn-sm flex-grow-1 py-3 rounded-4 fw-bold border transition-all d-flex flex-column align-items-center gap-2 ${filters.isAC === 'true' ? 'btn-dark border-dark shadow-sm' : 'btn-light border-light-subtle'}`}
                                onClick={() => { setFilters({...filters, isAC: filters.isAC === 'true' ? '' : 'true'}); setCurrentPage(1); }}
                            >
                                <FaSnowflake className={filters.isAC === 'true' ? 'text-info' : 'text-muted'} size={18} />
                                <span className="x-small">AC Hall</span>
                            </button>

                            <button 
                                className={`btn btn-sm flex-grow-1 py-3 rounded-4 fw-bold border transition-all d-flex flex-column align-items-center gap-2 ${filters.isAC === 'false' ? 'btn-dark border-dark shadow-sm' : 'btn-light border-light-subtle'}`}
                                onClick={() => { setFilters({...filters, isAC: filters.isAC === 'false' ? '' : 'false'}); setCurrentPage(1); }}
                            >
                                <div className="position-relative">
                                    <FaSnowflake className="text-muted" size={18} style={{ opacity: 0.3 }} />
                                    <div className="position-absolute top-50 start-50 translate-middle bg-danger" style={{ width: '20px', height: '2px', transform: 'translate(-50%, -50%) rotate(-45deg)' }}></div>
                                </div>
                                <span className="x-small">Non-AC</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer for Sidebar */}
                <div className="filter-sidebar-footer p-3 bg-white border-top shadow-lg" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                    <div className="row gx-2">
                        <div className="col-4">
                            <button className="btn btn-outline-dark w-100 py-2 rounded-3 fw-bold x-small" onClick={handleResetFilters}>
                                Reset
                            </button>
                        </div>
                        <div className="col-8">
                            <button className="btn btn-danger w-100 py-2 rounded-3 fw-bold small shadow-sm" onClick={() => setShowFilters(false)}>
                                Show {totalMahals} Results
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-5">
                <div className="mb-5">
                    <h4 className="fw-bold mb-0 text-dark">
                        {totalMahals} {totalMahals === 1 ? 'Venue' : 'Venues'} Found
                        {Object.values(filters).some(x => x !== '') && <span className="small text-muted ms-2 fw-normal">(Filtered)</span>}
                    </h4>
                </div>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center py-5 bg-white rounded-4 shadow-sm" style={{ minHeight: '500px' }}>
                        <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                        <span className="text-muted fw-medium h5">Finding perfect venues...</span>
                    </div>
                ) : venues.length > 0 ? (
                    <>
                        <div className="row g-4">
                            {venues.map((venue, index) => (
                                <div className="col-sm-6 col-md-4 col-xl-3" key={venue._id}>
                                    <div 
                                        className="venue-card-premium h-100 shadow-sm transition-all animate-fade-in-up" 
                                        style={{ 
                                            animationDelay: `${index * 0.05}s`, 
                                            cursor: 'pointer', 
                                            background: '#fff', 
                                            borderRadius: '24px', 
                                            overflow: 'hidden',
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}
                                        onClick={() => handleOpenDetail(venue)}
                                    >
                                        {/* Image Section */}
                                        <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
                                            <img 
                                                src={`${API_URL.replace('/api', '')}/${venue.coverImage}`} 
                                                className="img-fluid w-100 h-100 object-fit-cover transition-all venue-img" 
                                                alt={venue.mahalName} 
                                            />
                                            
                                            {/* Top Badges */}
                                            <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-2">
                                                <span className="badge bg-white text-dark shadow-sm px-2 py-1 small fw-bold rounded-pill">
                                                    {venue.mahalType}
                                                </span>
                                            </div>

                                            <div className="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-end gap-2">
                                                <div className="badge bg-white text-dark shadow-sm px-2 py-1 rounded-pill fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                                                    <FaStar className="text-warning" /> 
                                                    {venue.averageRating ? venue.averageRating.toFixed(1) : '0.0'}
                                                </div>
                                                {venue.facilities?.ac && (
                                                    <div className="badge bg-info text-white shadow-sm px-2 py-1 rounded-pill fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.6rem' }}>
                                                        <FaSnowflake size={8} /> AC
                                                    </div>
                                                )}
                                            </div>

                                            {/* Location Overlay */}
                                            <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                                                <div className="d-flex align-items-center gap-2 text-white x-small fw-bold">
                                                    <FaMapMarkerAlt size={10} className="text-danger" />
                                                    {venue.city}
                                                </div>
                                            </div>

                                            {/* Price Tag */}
                                            <div className="position-absolute bottom-0 end-0 m-2">
                                                <div className="bg-danger text-white px-2 py-1 rounded-3 fw-bold shadow-sm x-small">
                                                    ₹{venue.fullDayPrice?.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-3">
                                            <h6 className="fw-bold mb-2 text-dark text-truncate">{venue.mahalName}</h6>
                                            
                                            <div className="row g-2 mb-3">
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center gap-2 text-secondary x-small fw-medium">
                                                        <FaUsers className="text-danger" size={12} />
                                                        <span>{venue.seatingCapacity}+ Capacity</span>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="d-flex align-items-center gap-2 text-secondary x-small fw-medium">
                                                        {venue.facilities?.ac ? (
                                                            <>
                                                                <FaSnowflake className="text-info" size={12} />
                                                                <span>AC Hall Available</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #999' }}></div>
                                                                <span>Non-AC Venue</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                className="btn btn-outline-dark w-100 rounded-pill py-2 fw-bold x-small d-flex align-items-center justify-content-center gap-2 transition-all av-card-btn"
                                                onClick={(e) => { e.stopPropagation(); handleOpenDetail(venue); }}
                                            >
                                                Details <FaChevronRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {venues.length > 0 && (
                            <div className="d-flex justify-content-center mt-5 gap-2 animate-fade-in">
                                <button 
                                    className="btn btn-white shadow-sm rounded-circle p-2 d-flex align-items-center justify-content-center border premium-page-btn"
                                    disabled={currentPage === 1 || loading}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <FaChevronLeft size={12} />
                                </button>
                                <div className="d-flex align-items-center px-3 bg-white rounded-pill shadow-sm border fw-bold text-dark x-small mb-0">
                                    PAGE {currentPage} / {totalPages || 1}
                                </div>
                                <button 
                                    className="btn btn-white shadow-sm rounded-circle p-2 d-flex align-items-center justify-content-center border premium-page-btn"
                                    disabled={currentPage === totalPages || totalPages <= 1 || loading}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <FaChevronRight size={12} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm d-flex flex-column align-items-center">
                        <div className="mb-4 bg-light p-5 rounded-circle">
                            <FaSearch size={60} className="text-muted opacity-50" />
                        </div>
                        <h3 className="fw-bold text-dark">No Venues Found</h3>
                        <p className="text-muted mb-4 lead">We couldn't find any venues matching your current filters.</p>
                        <div className="d-flex gap-3">
                            <button className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold" onClick={handleResetFilters}>
                                Reset All Filters
                            </button>
                            <button className="btn btn-danger rounded-pill px-4 py-2 fw-bold" onClick={() => setShowFilters(true)}>
                                Change Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            <style>{`
                .filter-sidebar-slider {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 400px;
                    height: 100vh;
                    background: #fff;
                    z-index: 3001;
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                    box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .filter-sidebar-slider.open {
                    right: 0;
                }
                @media (max-width: 576px) {
                    .filter-sidebar-slider {
                        width: 100%;
                        right: -100%;
                    }
                }
                .filter-sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.3);
                    z-index: 3000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .filter-sidebar-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                .filter-sidebar-body {
                    overflow-y: auto;
                    flex: 1;
                }

                .lp-venue-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
                .lp-venue-card:hover img {
                    transform: scale(1.1);
                }
                .price-tag-small {
                    background: #C8102E;
                    color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(200, 16, 46, 0.3);
                }
                .x-small { font-size: 0.7rem; }
                .nav-page-btn {
                    width: 50px;
                    height: 50px;
                    transition: all 0.3s;
                }
                .nav-page-btn:hover:not(:disabled) {
                    background: #dc3545;
                    color: #fff;
                    border-color: #dc3545;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AllVenuesPage;
