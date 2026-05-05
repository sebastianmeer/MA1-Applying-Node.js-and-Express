const categories = ['Electronics', 'Clothes', 'Books', 'Food', 'Home', 'Services', 'Sports', 'Others'];

export default function ProductForm({ onSubmit, submitting }) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') delete payload[key];
    });

    payload.price = Number(payload.price);
    if (payload.priceDiscount !== undefined) payload.priceDiscount = Number(payload.priceDiscount);
    payload.premiumProducts = form.has('premiumProducts');

    onSubmit(payload, event.currentTarget);
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        <span>Name</span>
        <input name="name" minLength="3" maxLength="80" required />
      </label>

      <label>
        <span>Seller</span>
        <input name="seller" minLength="2" maxLength="80" required />
      </label>

      <label>
        <span>Category</span>
        <select name="category" required defaultValue="">
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Price</span>
        <input name="price" type="number" min="1" step="0.01" required />
      </label>

      <label>
        <span>Discount</span>
        <input name="priceDiscount" type="number" min="0" step="0.01" />
      </label>

      <label>
        <span>Posted Date</span>
        <input name="postedDate" type="date" />
      </label>

      <label className="wide">
        <span>Description</span>
        <textarea name="description" maxLength="50" rows="3" />
      </label>

      <label className="check-row">
        <input name="premiumProducts" type="checkbox" />
        <span>Premium product hidden from normal product queries</span>
      </label>

      <button className="btn primary wide" disabled={submitting}>
        {submitting ? 'Saving...' : 'Create Product'}
      </button>
    </form>
  );
}
