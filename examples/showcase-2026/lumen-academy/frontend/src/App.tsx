import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

import CourseDetailPage from './pages/CourseDetailPage';
import CourseCreatePage from './pages/CourseCreatePage';
import CourseEditPage from './pages/CourseEditPage';
import LessonListPage from './pages/LessonListPage';
import LessonDetailPage from './pages/LessonDetailPage';
import LessonCreatePage from './pages/LessonCreatePage';
import LessonEditPage from './pages/LessonEditPage';
import EnrollmentDetailPage from './pages/EnrollmentDetailPage';
import EnrollmentCreatePage from './pages/EnrollmentCreatePage';
import EnrollmentEditPage from './pages/EnrollmentEditPage';
import StudentListPage from './pages/StudentListPage';
import StudentDetailPage from './pages/StudentDetailPage';
import StudentCreatePage from './pages/StudentCreatePage';
import StudentEditPage from './pages/StudentEditPage';
import CatalogoDeCursosWorkspacePage from './pages/CatalogoDeCursosWorkspacePage';
import MatriculasWorkspacePage from './pages/MatriculasWorkspacePage';




function App() {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />

        <Route path="/courses" element={<Layout><CatalogoDeCursosWorkspacePage /></Layout>} />
        <Route path="/courses/new" element={<Layout><CourseCreatePage /></Layout>} />
        <Route path="/courses/:id/edit" element={<Layout><CourseEditPage /></Layout>} />
        <Route path="/courses/:id" element={<Layout><CourseDetailPage /></Layout>} />
        <Route path="/lessons" element={<Layout><LessonListPage /></Layout>} />
        <Route path="/lessons/new" element={<Layout><LessonCreatePage /></Layout>} />
        <Route path="/lessons/:id/edit" element={<Layout><LessonEditPage /></Layout>} />
        <Route path="/lessons/:id" element={<Layout><LessonDetailPage /></Layout>} />
        <Route path="/enrollments" element={<Layout><MatriculasWorkspacePage /></Layout>} />
        <Route path="/enrollments/new" element={<Layout><EnrollmentCreatePage /></Layout>} />
        <Route path="/enrollments/:id/edit" element={<Layout><EnrollmentEditPage /></Layout>} />
        <Route path="/enrollments/:id" element={<Layout><EnrollmentDetailPage /></Layout>} />
        <Route path="/students" element={<Layout><StudentListPage /></Layout>} />
        <Route path="/students/new" element={<Layout><StudentCreatePage /></Layout>} />
        <Route path="/students/:id/edit" element={<Layout><StudentEditPage /></Layout>} />
        <Route path="/students/:id" element={<Layout><StudentDetailPage /></Layout>} />

        </Routes>
      
    </Router>
  );
}

export default App;