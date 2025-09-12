-- Sample Data for Saraswati School Gochtada
-- Run this script in your Supabase SQL Editor after running the migrations

-- Insert sample staff members
INSERT INTO public.staff (name, position, qualifications, experience, bio, is_director, display_order) VALUES
('Dr. Priya Sharma', 'Principal', 'Ph.D. in Education, M.A. English, B.Ed.', '20+ years in education leadership', 'Dr. Priya Sharma brings over two decades of experience in educational leadership. She is passionate about creating an environment where every student can thrive academically and personally.', true, 1),
('Mr. Rajesh Kumar', 'Vice Principal', 'M.A. Mathematics, B.Ed.', '15+ years teaching experience', 'Mr. Rajesh Kumar is dedicated to maintaining high academic standards and supporting both students and teachers in their educational journey.', false, 2),
('Ms. Anjali Singh', 'Head of English Department', 'M.A. English Literature, B.Ed.', '12+ years teaching experience', 'Ms. Anjali Singh is passionate about literature and language. She encourages students to develop critical thinking and communication skills.', false, 3),
('Mr. Vikram Patel', 'Head of Science Department', 'M.Sc. Physics, B.Ed.', '10+ years teaching experience', 'Mr. Vikram Patel makes science engaging and accessible to all students. He believes in hands-on learning and practical applications.', false, 4),
('Ms. Sunita Mehta', 'Head of Mathematics Department', 'M.Sc. Mathematics, B.Ed.', '8+ years teaching experience', 'Ms. Sunita Mehta helps students overcome math anxiety and develop problem-solving skills through innovative teaching methods.', false, 5),
('Mr. Amit Joshi', 'Physical Education Teacher', 'B.P.Ed., Diploma in Sports Science', '6+ years teaching experience', 'Mr. Amit Joshi promotes physical fitness and sportsmanship among students. He organizes various sports activities and competitions.', false, 6);

-- Insert sample events
INSERT INTO public.events (title, description, event_date, event_time, location, is_featured) VALUES
('Annual Sports Day', 'Join us for our annual sports day featuring various athletic competitions, cultural performances, and awards ceremony.', '2024-03-15', '09:00:00', 'School Ground', true),
('Science Exhibition', 'Students showcase their innovative science projects and experiments. Open to parents and community members.', '2024-04-20', '10:00:00', 'School Auditorium', true),
('Cultural Festival', 'A celebration of Indian culture with dance, music, drama, and art exhibitions by our talented students.', '2024-05-10', '06:00:00', 'School Auditorium', false),
('Parent-Teacher Meeting', 'Quarterly meeting to discuss student progress and academic performance with parents.', '2024-06-05', '09:00:00', 'Classrooms', false),
('Graduation Ceremony', 'Celebrating the achievements of our Class 12 students as they complete their school journey.', '2024-07-15', '04:00:00', 'School Auditorium', true),
('Book Fair', 'Annual book fair featuring educational books, novels, and reference materials for students and parents.', '2024-08-25', '09:00:00', 'School Library', false);

-- Insert sample news articles
INSERT INTO public.news (title, content, excerpt, is_published, is_featured) VALUES
('Welcome to the New Academic Year 2024-25', '<p>We are excited to welcome all students, parents, and staff to the new academic year 2024-25. This year promises to be filled with learning, growth, and exciting opportunities.</p><p>Our focus this year will be on:</p><ul><li>Enhancing digital learning experiences</li><li>Promoting environmental awareness</li><li>Strengthening community partnerships</li><li>Supporting student mental health and wellbeing</li></ul><p>We look forward to another successful year of academic excellence and personal development.</p>', 'Welcome to the new academic year! We are excited to share our plans for 2024-25 and look forward to another year of growth and learning.', true, true),
('School Achieves 100% Pass Rate in Board Examinations', '<p>We are proud to announce that Saraswati School has achieved a 100% pass rate in both Class 10 and Class 12 board examinations this year.</p><p>Our students have shown exceptional performance with:</p><ul><li>95% of students scoring above 80%</li><li>60% of students scoring above 90%</li><li>15 students achieving perfect scores in various subjects</li></ul><p>This achievement reflects the dedication of our students, teachers, and the support of our parents. Congratulations to all!</p>', 'Saraswati School celebrates 100% pass rate in board examinations with outstanding student performance across all subjects.', true, true),
('New Computer Lab Inauguration', '<p>We are delighted to announce the inauguration of our new state-of-the-art computer laboratory.</p><p>The new lab features:</p><ul><li>30 high-performance computers</li><li>Interactive smart boards</li><li>High-speed internet connectivity</li><li>Modern software for programming and design</li></ul><p>This facility will enhance our students'' digital literacy and prepare them for the technology-driven future.</p>', 'New computer laboratory with modern equipment inaugurated to enhance digital learning experiences for students.', true, false),
('Environmental Awareness Campaign', '<p>Our school is launching a comprehensive environmental awareness campaign to promote sustainability and eco-friendly practices.</p><p>The campaign includes:</p><ul><li>Tree plantation drives</li><li>Waste reduction initiatives</li><li>Energy conservation programs</li><li>Environmental education workshops</li></ul><p>Students, teachers, and parents are encouraged to participate in making our school and community more environmentally conscious.</p>', 'Join our environmental awareness campaign to promote sustainability and eco-friendly practices in our school community.', true, false);

-- Insert sample achievements
INSERT INTO public.achievements (title, description, class_level, year, is_featured) VALUES
('100% Pass Rate in Class 12 Board Exams', 'All students successfully passed the Class 12 board examinations with excellent grades.', '12', 2024, true),
('State Level Science Fair Winners', 'Our students won first place in the state science fair competition with their innovative project on renewable energy.', '10', 2024, true),
('Mathematics Olympiad Champions', 'Students secured top positions in the district mathematics olympiad, showcasing exceptional problem-solving skills.', 'both', 2024, false),
('Sports Excellence Award', 'School cricket team won the inter-school championship, demonstrating outstanding sportsmanship and skill.', 'both', 2023, false),
('Cultural Festival Recognition', 'Our school''s cultural team received recognition at the district cultural festival for their outstanding performances.', 'both', 2023, false),
('Environmental Conservation Award', 'Students'' environmental club received the district award for their innovative conservation projects.', 'both', 2024, false);

-- Insert sample gallery categories (these should already exist from migrations, but adding more)
INSERT INTO public.gallery_categories (name, description) VALUES
('Annual Day', 'Photos and videos from annual day celebrations and performances'),
('Sports Events', 'Athletic competitions, sports day, and physical activities'),
('Academic Activities', 'Classroom activities, labs, and academic competitions'),
('Cultural Programs', 'Cultural events, festivals, and traditional celebrations'),
('Infrastructure', 'School buildings, classrooms, and facilities'),
('Student Life', 'Daily school life, interactions, and candid moments');

-- Insert sample gallery items (you'll need to upload actual images to Supabase Storage)
-- Note: These are placeholder entries. You'll need to upload actual images and update the media_url
INSERT INTO public.gallery_items (title, description, media_url, media_type, category_id) VALUES
('Annual Sports Day 2024', 'Students participating in various athletic events during the annual sports day', 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Sports+Day', 'image', (SELECT id FROM gallery_categories WHERE name = 'Sports Events' LIMIT 1)),
('Science Exhibition', 'Students showcasing their innovative science projects and experiments', 'https://via.placeholder.com/800x600/059669/FFFFFF?text=Science+Exhibition', 'image', (SELECT id FROM gallery_categories WHERE name = 'Academic Activities' LIMIT 1)),
('Cultural Festival Performance', 'Students performing traditional dance during the cultural festival', 'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Cultural+Performance', 'image', (SELECT id FROM gallery_categories WHERE name = 'Cultural Programs' LIMIT 1)),
('School Building', 'Beautiful view of our school building and campus', 'https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=School+Building', 'image', (SELECT id FROM gallery_categories WHERE name = 'Infrastructure' LIMIT 1)),
('Classroom Activity', 'Students engaged in interactive learning activities', 'https://via.placeholder.com/800x600/EA580C/FFFFFF?text=Classroom+Activity', 'image', (SELECT id FROM gallery_categories WHERE name = 'Student Life' LIMIT 1));

-- Insert sample contact inquiries (for testing admin functionality)
INSERT INTO public.contact_inquiries (name, email, phone, subject, message, is_read) VALUES
('Mrs. Sunita Gupta', 'sunita.gupta@email.com', '+91 98765 43210', 'Admission Inquiry', 'I am interested in admitting my daughter to Class 6. Could you please provide information about the admission process and required documents?', false),
('Mr. Amit Singh', 'amit.singh@email.com', '+91 98765 43211', 'Fee Structure', 'Could you please share the fee structure for Class 10 for the academic year 2024-25?', false),
('Dr. Rajesh Verma', 'rajesh.verma@email.com', '+91 98765 43212', 'Career Counseling', 'I would like to schedule a career counseling session for my son who is in Class 12. Please let me know the available timings.', true);

-- Insert sample newsletter subscriptions
INSERT INTO public.newsletter_subscriptions (email, is_active) VALUES
('parent1@email.com', true),
('parent2@email.com', true),
('alumni1@email.com', true),
('community@email.com', true);

-- Verify data insertion
SELECT 'Staff Members' as table_name, COUNT(*) as count FROM staff
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'News Articles', COUNT(*) FROM news
UNION ALL
SELECT 'Achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'Gallery Categories', COUNT(*) FROM gallery_categories
UNION ALL
SELECT 'Gallery Items', COUNT(*) FROM gallery_items
UNION ALL
SELECT 'Contact Inquiries', COUNT(*) FROM contact_inquiries
UNION ALL
SELECT 'Newsletter Subscriptions', COUNT(*) FROM newsletter_subscriptions;
