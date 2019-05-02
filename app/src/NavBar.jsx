import React, { PureComponent } from "react";
import logo from "./logo.svg";

class NavBar extends PureComponent {
  render() {
    return (
      <nav className="navbar sticky-top navbar-dark text-white bg-dark">
        <img
          className="navbar-brand d-inline-block align-middle"
          src={logo}
          width="64px"
          height="64px"
          alt="splitter-logo"
        />
        <h4 className="nav-text">
          {this.props.isPaused && (
            <span className="badge badge-danger">{" > PAUSED < "}</span>
          )}
        </h4>
        <h2 className="nav-text">
          <strong>BLOCKSTARS Splitter</strong>
        </h2>
        <ul className="navbar-nav">
          <li className="nav-item">
            <a
              href={`https://etherscan.io/address/${this.props.address}`}
              className="nav-link"
              rel="noopener noreferrer"
              target="_blank"
            >
              {this.props.address}
            </a>
          </li>
        </ul>
      </nav>
    );
  }
}

export default NavBar;
