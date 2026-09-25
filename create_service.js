const fs = require("fs");
let content = fs.readFileSync("FRONTEND/src/services/assignment.service.js", "utf-8");

const newMethods = `
export const submitAssignment = async (assignmentId, formData) => {
  const response = await api.post(\`/api/assignment/\${assignmentId}/submit\`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMySubmission = async (assignmentId) => {
  const response = await api.get(\`/api/assignment/\${assignmentId}/my-submission\`);
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await api.get(\`/api/assignment/\${assignmentId}/submissions\`);
  return response.data;
};

export const evaluateSubmission = async (submissionId, marks, feedback) => {
  const response = await api.patch(\`/api/assignment/submissions/\${submissionId}/evaluate\`, { marks, feedback });
  return response.data;
};
`;

content = content.replace("export default {", newMethods + "\nexport default {");
content = content.replace("deleteAssignment,", "deleteAssignment,\n  submitAssignment,\n  getMySubmission,\n  getAssignmentSubmissions,\n  evaluateSubmission,");

fs.writeFileSync("FRONTEND/src/services/assignment.service.js", content);

