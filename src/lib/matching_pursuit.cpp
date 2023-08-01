#include "matching_pursuit.h"

Eigen::VectorXd omp(const Eigen::MatrixXd &X, const Eigen::VectorXd &y, int N) {
  int n = X.cols();                                 // Number of vectors
  Eigen::VectorXd r = y;                            // Residual
  Eigen::VectorXd theta = Eigen::VectorXd::Zero(n); // Coefficients
  std::vector<int> support;

  for (int i = 0; i < N; ++i) {
    // Find the index that maximizes alignment with the residual
    Eigen::VectorXd correlations = X.transpose() * r;
    int idx;
    correlations.cwiseAbs().maxCoeff(&idx);

    // Add the index to the support
    support.push_back(idx);

    // Build the matrix of vectors in the support
    Eigen::MatrixXd Xs = Eigen::MatrixXd::Zero(X.rows(), support.size());
    for (size_t j = 0; j < support.size(); ++j)
      Xs.col(j) = X.col(support[j]);

    // Solve the least squares problem
    Eigen::VectorXd theta_s =
        Xs.jacobiSvd(Eigen::ComputeThinU | Eigen::ComputeThinV).solve(y);

    // Update the coefficients and the residual
    for (size_t j = 0; j < support.size(); ++j)
      theta(support[j]) = theta_s(j);

    r = y - X * theta;
  }

  return theta;
}
