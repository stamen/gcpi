import {connect} from 'react-redux';
import {selectImageFile, toggleControlPointMode, updateControlPoint, addControlPoint, setControlPointPosition, deleteControlPoint} from '../state/actions';
import Images from '../components/Images';

const mapStateToProps = (state) => state;
export default connect(mapStateToProps, {selectImageFile, toggleControlPointMode, updateControlPoint, addControlPoint, setControlPointPosition, deleteControlPoint})(Images);