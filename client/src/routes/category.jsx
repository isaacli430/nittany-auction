import { useEffect, useState } from 'react';
import Base from '../components/base';

export default function Category() {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        async function loadCategories() {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        }
        loadCategories();
    }, []);

    const rootCategories = categories.filter(c => !c.parent_category);
    const getChildren = (parentName) => categories.filter(c => c.parent_category === parentName);

    function CategoryNode({ category }) {
        const children = getChildren(category.category_name);
        return (
            <div>
                <div>{category.category_name}</div>
                {children.map((child, index) => (
                    <CategoryNode key={index} category={child} />
                ))}
            </div>
        );
    }
    return (
        <>
            <Base title="Categories" logged={true} />
            <h1>Category Hierarchy</h1>
            {rootCategories.map((cat, index) => (
                <CategoryNode key={index} category={cat} />
            ))}
        </>
    );
}
