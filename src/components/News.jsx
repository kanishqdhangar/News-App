import React, { useEffect, useState, useMemo } from "react";
import { TextField, Button, Grid, Typography, Card, CardContent, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";

const News = () => {
    const [category, setCategory] = useState('general'); // State to hold category
    const [newsData, setNewsData] = useState([]); //State to hold News fetched from api
    const [searchQuery, setSearchQuery] = useState(''); //State to hold searched text
    const [selectedNews, setSelectedNews] = useState(null); // State to hold selected news item
    const [currentPage, setCurrentPage] = useState(1); // State to track current page number
    const [newsPerPage] = useState(4); // Number of news articles per page
    const [activeCategory, setActiveCategory] = useState('general'); // State to track active category

    // Memoized function to fetch news data
    const fetchNewsData = useMemo(() => {
        return async (category) => {
            try {
                const response = await fetch(`https://saurav.tech/NewsAPI/top-headlines/category/${category}/in.json`);
                if (!response.ok) {
                    throw new Error('Failed to fetch news data');
                }
                const data = await response.json();
                setNewsData(data.articles); // Assuming data structure has an "articles" array
            } catch (error) {
                console.error('Error while fetching news', error);
            }
        };
    }, []);

    // Fetch news data when component mounts or category changes
    useEffect(() => {
        fetchNewsData(category);
    }, [fetchNewsData, category]);

    // Handle category selection
    const handleCategoryClick = (category) => {
        setCategory(category); // Sets desired category
        setSearchQuery(''); // Clear search query when changing category
        setCurrentPage(1); // Reset page number to 1 when category changes
        fetchNewsData(category); // Featches news with desired category
        setSelectedNews(null); // Clear selected news when category entered
        setActiveCategory(category); // Set active category
    };
    
    // Reset category to 'general' and clear search query
    const resetCategories = () => {
        setCategory('general'); // Sets category to general
        setSearchQuery(''); // Clear search query when home clicked
        setCurrentPage(1); // Reset page number to 1 when resetting categories
        fetchNewsData('general'); // Fetches news with general category
        setSelectedNews(null); // Clear selected news when home clicked
        setActiveCategory('general'); // Reset active category
    };

    // Handle search input change
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Handle search button click
    const handleSearch = () => {
        // Perform search based on searchQuery
        if (!searchQuery.trim()) {
            // If searchQuery is empty, fetch all news again
            fetchNewsData(category);
        } else {
            // Filter newsData based on searchQuery
            const filteredData = newsData.filter(news =>
                news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                news?.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            // Saves filtered news in newsData
            setNewsData(filteredData);
            setCurrentPage(1); // Reset page number to 1 when performing search
        }
    };

    // Handle click on a news item to show detailed view
    const handleNewsItemClick = (news) => {
        setSelectedNews(news); // Saves current news to display in detail
    };

    // Function to render detailed news content
    const renderDetailedNews = () => {
        // To check if there is any news selected or not 
        if (!selectedNews) {
            return null;
        }

        return (
            <Card className="detailed-news">
                {selectedNews.urlToImage && (
                    <CardMedia
                        component="img"
                        height="400"
                        image={selectedNews.urlToImage}
                        alt="News Thumbnail"
                    />
                )}
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {selectedNews.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {selectedNews.content || selectedNews.description}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        Author: {selectedNews.author || 'Unknown'}
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        <a href={selectedNews.url} target="_blank" rel="noopener noreferrer">Read More</a>
                    </Typography>
                    <Button onClick={() => setSelectedNews(null)}>Go Back</Button>
                </CardContent>
            </Card>
        );
    };

    // Function to render news items for the current page
    const renderNewsItems = () => {
        // To check any news fetched to display or not
        if (newsData.length === 0) {
            return <Typography variant="body1">No news articles found.</Typography>;
        }

        // Calculate pagination logic
        const indexOfLastNews = currentPage * newsPerPage;
        const indexOfFirstNews = indexOfLastNews - newsPerPage;
        const currentNews = newsData.slice(indexOfFirstNews, indexOfLastNews);

        return (
            <>
            {currentNews.map((news, index) => (
                <Card key={index} className='news-items sm:w-full lg:w-1/2 ' justifyContent="center" onClick={() => handleNewsItemClick(news)}>
                    {news.urlToImage && (
                    <CardMedia component="img" height="140" image={news.urlToImage} alt="News Thumbnail" />
                    )}
                    <CardContent className="news ">
                        <div variant="h5" component="div" className='sm:text-sm lg:text-2xl'>
                            {/* Title as hyperlink */}
                            <Link to="#" onClick={() => handleNewsItemClick(news)}>{news.title}</Link>
                        </div>
                        <Typography variant="body2" color="text.secondary" className="sm:text-xs">
                            {news.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {news.author || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {new Date(news.publishedAt).toLocaleString()}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
            <Grid container justifyContent="center" spacing={2}>
                <Grid item>
                    <Button variant="contained" disabled={currentPage === 1} onClick={() => handlePageChange('prev')}>
                        Previous
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" className="!bg-white !text-black">
                        {currentPage}
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" disabled={currentPage === Math.ceil(newsData.length / newsPerPage)} onClick={() => handlePageChange('next')}>
                        Next
                    </Button>
                </Grid>
            </Grid>
            </>
        );
    };

    // Function to handle pagination
    const handlePageChange = (action) => {
        if (action === 'prev' && currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        } else if (action === 'next' && currentPage < Math.ceil(newsData.length / newsPerPage)) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    // Create a new Date object
    const currentDate = new Date();

    // Format the date based on the options
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'long', // long name of the day (e.g., "Monday")
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
        <Grid container className='nav' alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item>
                <div variant="h6" className="sm:text-xs lg:text-2xl">{formattedDate}</div>
            </Grid>
            <Grid item>
                <Typography variant="h4">News App</Typography>
            </Grid>
            <Grid item className="right">
                <TextField placeholder="Search news..." variant="outlined" size="small" value={searchQuery} onChange={handleSearchInputChange} />
                <Button variant="contained" color="primary" onClick={handleSearch}>
                    Search
                </Button>
            </Grid>
        </Grid>
        <Grid container className='lowernav ' justifyContent="center">
            <Grid item>
                <Button className='category-button' onClick={resetCategories}>
                    Home
                </Button>
            </Grid>
            <Grid item>
                <Button className={activeCategory === 'health' ? 'active-category-button' : 'category-button'} onClick={() => handleCategoryClick('health')}>
                    Health
                </Button>
            </Grid>
            <Grid item>
                <Button className={activeCategory === 'business' ? 'active-category-button' : 'category-button'} onClick={() => handleCategoryClick('business')}>
                    Business
                </Button>
            </Grid>
            <Grid item>
                <Button className={activeCategory === 'science' ? 'active-category-button' : 'category-button'} onClick={() => handleCategoryClick('science')}>
                    Science
                </Button>
            </Grid>
            <Grid item>
                <Button className={activeCategory === 'sports' ? 'active-category-button' : 'category-button'} onClick={() => handleCategoryClick('sports')}>
                    Sports
                </Button>
            </Grid>
            <Grid item>
                <Button className={activeCategory === 'technology' ? 'active-category-button' : 'category-button'} onClick={() => handleCategoryClick('technology')}>
                    Technology
                </Button>
            </Grid>
            </Grid>
            <Grid container direction="column" className='wrapper' alignItems="center" minWidth="100vw" spacing={2}>
                {selectedNews ? renderDetailedNews() : renderNewsItems()}
            </Grid>
        </>
    );
}

export default News;
