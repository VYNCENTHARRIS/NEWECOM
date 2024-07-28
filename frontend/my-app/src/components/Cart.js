import React, { useState, useEffect } from "react";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    fetch("https://newecom-p2yc.onrender.com/cart")
      .then((response) => response.json())
      .then((data) => setCartItems(data))
      .catch((error) => console.error("Error fetching cart items:", error));
  }, []);

  const removeFromCart = (productId) => {
    fetch(`https://newecom-p2yc.onrender.com/cart/${productId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setCartItems(cartItems.filter((item) => item.id !== productId));
        } else {
          console.error("Failed to remove item from cart");
        }
      })
      .catch((error) => console.error("Error removing item from cart:", error));
  };

  return (
    <div className="container">
      <h1>Cart</h1>
      <div className="row">
        {cartItems.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img
                src={`https://newecom-p2yc.onrender.com/public/${item.image_url}`}
                className="card-img-top"
                alt={item.name}
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>

                <button
                  className="btn btn-danger"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;
