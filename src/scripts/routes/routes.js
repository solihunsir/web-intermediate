import HomePage from "../pages/home/home-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import AddPage from "../pages/add/add-page";
import DetailPage from "../pages/detail/detail-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import NotFound from "../pages/not-found/not-found";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new AddPage()),
  "/story/:id": () => checkAuthenticatedRoute(new DetailPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
  "*": () => checkAuthenticatedRoute(new NotFound()),
};

export default routes;
