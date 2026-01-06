'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert sample data
    await queryInterface.bulkInsert('tasks', [
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure GitHub Actions for automated deployment',
        status: 'completed',
        priority: 'high',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Implement SAST Scanning',
        description: 'Add Semgrep and SonarQube security scanning',
        status: 'completed',
        priority: 'high',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Deploy to Kubernetes',
        description: 'Setup Kubernetes manifests and deploy application',
        status: 'in-progress',
        priority: 'high',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Add Monitoring',
        description: 'Implement Prometheus and Grafana monitoring',
        status: 'pending',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Write Documentation',
        description: 'Complete project documentation and README',
        status: 'completed',
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tasks', null, {});
  }
};
