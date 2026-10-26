import { Link } from 'react-router-dom';
import logoDark from '@/assets/images/shadiundo.png';
import logoLight from '@/assets/images/shadiundo.png';

const LogoBox = ({
  containerClassName,
  squareLogo,
  textLogo
}) => {
  return <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark" >
        
        <img src={logoDark} className={textLogo?.className}  alt="logo dark" height={130}  />
      </Link>
      <Link to="/" className="logo-light">
       
        <img src={logoLight} className={textLogo?.className}  alt="logo light" height={130}/>
      </Link>
    </div>;
};


export default LogoBox;