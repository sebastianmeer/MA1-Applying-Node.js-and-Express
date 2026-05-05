export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{product.category}</p>
            <h2>{product.name}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close details">
            X
          </button>
        </div>

        <p className="muted">{product.description || 'No description provided.'}</p>

        <dl className="detail-grid">
          <div>
            <dt>Price</dt>
            <dd>PHP {product.price}</dd>
          </div>
          <div>
            <dt>Discount</dt>
            <dd>{product.priceDiscount ? `PHP ${product.priceDiscount}` : 'None'}</dd>
          </div>
          <div>
            <dt>Seller</dt>
            <dd>{product.seller}</dd>
          </div>
          <div>
            <dt>Posted</dt>
            <dd>{new Date(product.postedDate).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt>Days Posted</dt>
            <dd>{product.daysPosted ?? 0}</dd>
          </div>
          <div>
            <dt>Slug</dt>
            <dd>{product.productSlug || '-'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
