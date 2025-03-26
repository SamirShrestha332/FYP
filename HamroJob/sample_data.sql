-- Sample data for HamroJob application

-- Add sample users with hashed passwords (password is 'password123')
INSERT INTO users (username, email, password, phone, location, bio, skills, role, status) VALUES
('John Doe', 'john@example.com', '$2b$10$a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuVwXyZ', '9876543210', 'Kathmandu', 'Experienced software developer', 'JavaScript, React, Node.js', 'user', 'active'),
('Jane Smith', 'jane@example.com', '$2b$10$a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuVwXyZ', '8765432109', 'Pokhara', 'UI/UX designer with 5 years experience', 'Figma, Adobe XD, CSS', 'user', 'active'),
('Robert Johnson', 'robert@example.com', '$2b$10$a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuVwXyZ', '7654321098', 'Lalitpur', 'DevOps engineer', 'AWS, Docker, Kubernetes', 'user', 'active'),
('Emily Brown', 'emily@example.com', '$2b$10$a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuVwXyZ', '6543210987', 'Bhaktapur', 'Marketing specialist', 'SEO, Content Marketing, Social Media', 'user', 'active'),
('Admin User', 'admin@hamrojob.com', '$2b$10$a1B2c3D4e5F6g7H8i9J0kLmNoPqRsTuVwXyZ', '5432109876', 'Kathmandu', 'System Administrator', 'System Administration', 'admin', 'active');

-- Update your own user record with phone, location, bio and skills
-- Replace 'your_email@example.com' with your actual email address
UPDATE users SET 
    phone = '9801234567', 
    location = 'Kathmandu, Nepal', 
    bio = 'Full-stack developer with expertise in React and Node.js. Passionate about creating user-friendly web applications.',
    skills = 'JavaScript, React, Node.js, Express, MySQL, MongoDB'
WHERE email = 'shankarbolanat@gmail.com';

-- Add sample companies
INSERT INTO companies (name, email, phone, location, description, website, logo, status) VALUES
('TechNepal', 'info@technepal.com', '01-4567890', 'Kathmandu', 'Leading tech company in Nepal', 'www.technepal.com', 'technepal.jpg', 'active'),
('Digital Solutions', 'contact@digitalsolutions.com', '01-5678901', 'Lalitpur', 'IT services and solutions provider', 'www.digitalsolutions.com', 'digitalsolutions.jpg', 'active'),
('Mountain Code', 'hr@mountaincode.com', '01-6789012', 'Pokhara', 'Software development company', 'www.mountaincode.com', 'mountaincode.jpg', 'active'),
('Nepal Innovations', 'careers@nepalinnovations.com', '01-7890123', 'Bhaktapur', 'Technology innovation hub', 'www.nepalinnovations.com', 'nepalinnovations.jpg', 'active');

-- Add sample jobs
INSERT INTO jobs (title, company_id, location, type, salary, description, requirements, posted_by, status) VALUES
('Frontend Developer', 1, 'Kathmandu', 'Full-time', '60000-80000', 'We are looking for a skilled frontend developer to join our team.', 'HTML, CSS, JavaScript, React', 5, 'active'),
('Backend Developer', 1, 'Kathmandu', 'Full-time', '70000-90000', 'Seeking experienced backend developer for our growing team.', 'Node.js, Express, MongoDB', 5, 'active'),
('UI/UX Designer', 2, 'Lalitpur', 'Full-time', '50000-70000', 'Design beautiful and intuitive user interfaces for our products.', 'Figma, Adobe XD, UI/UX principles', 5, 'active'),
('DevOps Engineer', 3, 'Pokhara', 'Full-time', '80000-100000', 'Manage our cloud infrastructure and CI/CD pipelines.', 'AWS, Docker, Kubernetes, CI/CD', 5, 'active'),
('Content Writer', 4, 'Remote', 'Part-time', '30000-40000', 'Create engaging content for our digital platforms.', 'Excellent writing skills, SEO knowledge', 5, 'active'),
('Marketing Specialist', 4, 'Bhaktapur', 'Full-time', '50000-65000', 'Develop and implement marketing strategies.', 'Digital marketing, SEO, Social media', 5, 'active');
