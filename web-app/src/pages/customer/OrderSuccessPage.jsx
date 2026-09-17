import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { t } = useTranslation();

  return (
    <div className="order-success animate-scale-in">
      <div className="order-success__icon">
        <CheckCircle size={48} />
      </div>
      <h1 className="order-success__title">{t('order.success_title')}</h1>
      <p className="order-success__desc">{t('order.success_desc')}</p>
      <div className="order-success__actions">
        <Link to={`/orders/${orderId}`} className="btn btn--primary btn--lg">
          {t('order.view_order')} <ArrowRight size={18} />
        </Link>
        <Link to="/products" className="btn btn--secondary btn--lg">
          <ShoppingBag size={18} /> {t('order.continue')}
        </Link>
      </div>
    </div>
  );
}
