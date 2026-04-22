import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Base from '../components/base';

function Listings(){
    const [listings, setListings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function loadData(){
            const resCat = await fetch('/api/categories');
            const dataCat = await resCat.json();
            setCategories(dataCat);

            const resList = await fetch('/api/all-listings');
            const dataList = await resList.json();
            setListings(dataList);
        }
        loadData();
    },[]);

    const filteredListings = listings.filter(item => {
        const matchSearch =
            item.auction_title.toLowerCase().includes(search.toLowerCase()) || item.product_name.toLowerCase().includes(search.toLowerCase());

        const matchCategory =
            selectedCategory === '' || item.category === selectedCategory;

        return matchSearch && matchCategory;
    });

    const promotedItems = filteredListings.filter(item => item.promoted);
    const normalItems = filteredListings.filter(item => !item.promoted);

    return (
        <>
            <Base title = "Browse Listings" logged={true} />
            <h1>Browse Listings</h1>

            <div>
                Search:
                <input
                    value = {search}
                    onChange = {(e) => setSearch(e.target.value)}
                    placeholder = "Search product"
                />
            </div>
            <br />

            <div>
                Filter by Category:
                <select
                    value = {selectedCategory}
                    onChange = {(e) => setSelectedCategory(e.target.value)}
                >
                    <option value = "">All Categories</option>
                    {categories.map((cat,idx) => (
                        <option key = {idx} value = {cat.category_name}>
                            {cat.category_name}
                        </option>
                    ))}
                </select>
            </div>
            <br /><br />

            {promotedItems.length > 0 && (
                <div>
                    <h2>Promoted Listings</h2>
                    {promotedItems.map((item) => (
                        <div
                            key={item.listing_id}
                            onClick = {() => navigate(`/listing/${item.seller_email}/${item.listing_id} `)}
                        >
                            <h3>{item.auction_title}</h3>
                            <p>Category: {item.category}</p>
                            <p>Price: ${item.reserve_price}</p>
                        </div>
                    ))}
                    <br />
                </div>
            )}

            <h2>All Listings</h2>
            {filteredListings.length === 0 ? (
                <p>not found</p>
            ) : (
                normalItems.map((item) => (
                    <div
                        key = {item.listing_id}
                        onClick = {() => navigate(`/listing/${item.seller_email}/${item.listing_id}`)}
                    >
                        <h3>{item.auction_title}</h3>
                        <p>Category: {item.category}</p>
                        <p>Price: ${item.reserve_price}</p>
                    </div>
                ))
            )}
        </>

    );
}
export default Listings
