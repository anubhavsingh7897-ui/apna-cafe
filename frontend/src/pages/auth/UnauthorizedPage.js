import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <section className="notice-card">
      <span className="notice-icon">!</span>
      <h2>Access denied</h2>
      <p>Your role does not have permission to open this page.</p>
      <Link className="btn-secondary route-link standalone" to="/">
        Go to my workspace
      </Link>
    </section>
  );
}
