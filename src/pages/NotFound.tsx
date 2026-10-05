import { Link, useLocation } from "react-router-dom";
/** Shown for any address that is not a page. Says what was not found instead of silently showing Home. */
export default function NotFound() {
  const { pathname } = useLocation();
  return (<><h1>Page not found</h1><p className="lead">There is no page at <code>{pathname}</code>.</p>
    <p className="muted">The link may be old or mistyped. Try the search bar above, or go to <Link to="/">Home</Link>, <Link to="/explore">Explore</Link>, <Link to="/farm">Farm</Link> or <Link to="/plan">Plan</Link>.</p></>);
}
