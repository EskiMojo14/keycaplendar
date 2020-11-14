import PropTypes from "prop-types";

export const userTypes = {
  avatar: PropTypes.string,
  email: PropTypes.string,
  id: PropTypes.string,
  isAdmin: PropTypes.bool,
  isDesigner: PropTypes.bool,
  isEditor: PropTypes.bool,
  name: PropTypes.string,
  nickname: PropTypes.string,
};

export const setTypes = {
  colorway: PropTypes.string.isRequired,
  designer: PropTypes.arrayOf(PropTypes.string).isRequired,
  details: PropTypes.string.isRequired,
  gbEnd: PropTypes.string,
  gbLaunch: PropTypes.string,
  gbMonth: PropTypes.bool,
  icDate: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  profile: PropTypes.string.isRequired,
  sales: PropTypes.string,
  shipped: PropTypes.bool,
  vendors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string.isRequired,
      region: PropTypes.string.isRequired,
      storeLink: PropTypes.string,
    })
  ),
};

export const whitelistTypes = {
  edited: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  shipped: PropTypes.arrayOf(PropTypes.string),
  vendorMode: PropTypes.string,
  vendors: PropTypes.arrayOf(PropTypes.string),
};

export const statisticsTypes = {
  durationCat: PropTypes.string.isRequired,
  durationGroup: PropTypes.string.isRequired,
  shipped: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  timeline: PropTypes.string.isRequired,
};

export const statisticsSortTypes = {
  duration: PropTypes.string.isRequired,
  shipped: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};
