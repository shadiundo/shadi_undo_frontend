// Contact.jsx
import React, { useState } from "react";
import styled from "styled-components";
import { FiPhone } from "react-icons/fi";
import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";

/*
  Shaadi Undo Theme Colors:
    #EDDCCF  #CAAA93  #CFA98F  #03182A  #141C2C
*/

const Page = styled.div`
  width: 100%;
  font-family: "Inter", sans-serif;
  background: #fbfaf9;
  color: #141c2c;
`;

/* ------------------ HERO ------------------ */
const Hero = styled.section`
  background: linear-gradient(135deg, #eddcbf 21%, #caaa93 91%);
  padding: 72px 8%;
  display: flex;
  gap: 48px;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(19, 32, 42, 0.03);
`;

const HeroLeft = styled.div`
  flex: 1;
  min-width: 320px;
`;

const HTitle = styled.h1`
  font-size: 38px;
  color: #03182a;
  font-weight: 800;
  margin-bottom: 14px;
`;

const HSubtitle = styled.p`
  font-size: 16px;
  line-height: 1.7;
  max-width: 600px;
  color: #1b2735;
`;

const HeroCTA = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 20px;
`;

const CTAButton = styled.button`
  background: #cfa98f;
  color: white;
  padding: 12px 28px;
  border-radius: 30px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

  &:hover {
    background: #b58f78;
    transform: translateY(-3px);
  }
`;

const Secondary = styled.button`
  background: transparent;
  border: 2px solid rgba(19, 32, 42, 0.15);
  color: rgba(19, 32, 42, 0.7);
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
`;

/* ------------------ MAIN LAYOUT ------------------ */
const Container = styled.div`
  width: 100%;
  max-width: 1250px;
  margin: 40px auto;
  padding: 0 16px;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 40px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

/* ------------------ FORM ------------------ */
const Card = styled.form`
  background: #fff;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(19, 32, 42, 0.03);
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 1px solid rgba(19, 32, 42, 0.1);
  outline: none;

  &:focus {
    border-color: rgba(19, 32, 42, 0.25);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  height: 140px;
  border-radius: 10px;
  border: 1px solid rgba(19, 32, 42, 0.1);
  resize: vertical;

  &:focus {
    border-color: rgba(19, 32, 42, 0.25);
  }
`;

const Small = styled.p`
  font-size: 13px;
  color: #6b7785;
`;

const SubmitBtn = styled.button`
  background: #cfa98f;
  color: #fff;
  padding: 12px 26px;
  border: none;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.25s ease;

  &:hover {
    background: #b58f78;
    transform: translateY(-3px);
  }
`;

const Success = styled.div`
  background: #e8f9ec;
  padding: 12px;
  border-radius: 10px;
  color: #166534;
  margin-top: 16px;
`;

/* ------------------ PROFESSIONAL SIDEBAR ------------------ */
const Sidebar = styled.div`
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ContactCard = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(19, 32, 42, 0.05);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: flex-start;
  gap: 18px;
  transition: 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.08);
  }
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f4e9e2;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #cfa98f;
  font-size: 22px;
`;

const CIHead = styled.h3`
  margin: 0;
  font-size: 17px;
  color: #03182a;
  font-weight: 700;
`;

const CIText = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: #141c2c;
`;

/* MAP */
const Map = styled.iframe`
  width: 100%;
  height: 220px;
  border: 0;
  border-radius: 12px;
`;

/* ------------------ MAIN COMPONENT ------------------ */
export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <Page>
      {/* HERO */}
      <Hero>
        <HeroLeft>
          <HTitle>Contact Shaadi Undo</HTitle>
          <HSubtitle>
            Book a professional one-to-one video session with our counsellors,
            mediators and legal advisors. All sessions are confidential and 
            designed to support you in your separation or recovery journey.
          </HSubtitle>

          <HeroCTA>
            <CTAButton onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}>
              Book a Session
            </CTAButton>

            <Secondary onClick={() => window.scrollTo({ top: 1200, behavior: "smooth" })}>
              Explore Services
            </Secondary>
          </HeroCTA>
        </HeroLeft>
      </Hero>

      {/* MAIN CONTENT */}
      <Container>
        <Columns>
          
          {/* FORM */}
          <Card onSubmit={handleSubmit}>
            <h2 style={{ color: "#03182a", marginBottom: 10 }}>Send us a Message</h2>
            <Small>Our team will contact you within 24–48 hours.</Small>

            <Label>Your Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} />

            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleChange} />

            <Label>Phone Number</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />

            <Label>Your Message</Label>
            <Textarea name="message" value={form.message} onChange={handleChange} />

            <SubmitBtn type="submit">Submit</SubmitBtn>

            {submitted && <Success>Thank you! We will reach out soon.</Success>}
          </Card>

          {/* SIDEBAR */}
          <Sidebar>

            <ContactCard>
              <IconBox>
                <FiPhone />
              </IconBox>
              <div>
                <CIHead>Call Us</CIHead>
                <CIText>+91 XXXX something</CIText>
              </div>
            </ContactCard>

            <ContactCard>
              <IconBox>
                <HiOutlineMail />
              </IconBox>
              <div>
                <CIHead>Email</CIHead>
                <CIText>shadiundo@gmail.com</CIText>
              </div>
            </ContactCard>

            <ContactCard>
              <IconBox>
                <HiOutlineLocationMarker />
              </IconBox>
              <div>
                <CIHead>Address</CIHead>
                <CIText>
                  R-271, Block R, Part-1,<br />
                  Greater Kailash, New Delhi,<br />
                  Delhi 110048
                </CIText>
              </div>
            </ContactCard>

            <ContactCard>
              <IconBox>
                <HiOutlineLocationMarker />
              </IconBox>
              <div style={{ width: "100%" }}>
                <CIHead>Map</CIHead>
                <Map
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.7588756749504!2d77.23848257434504!3d28.48788969006527!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3cfff65bcb3%3A0x19d482d392ffe381!2sR-271%2C%20Block%20R%2C%20Greater%20Kailash%20I%2C%20Greater%20Kailash%2C%20New%20Delhi%2C%20Delhi%20110048!5e0!3m2!1sen!2sin!4v1709790382343"
                ></Map>
              </div>
            </ContactCard>

          </Sidebar>
        </Columns>
      </Container>
    </Page>
  );
}
