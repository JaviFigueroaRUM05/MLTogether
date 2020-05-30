git clone https://github.com/JaviFigueroaRUM05/MLTogether.git
cd MLTogether/ml-together-angular-frontend
npm install
npm run build-prod
cd ../..
rm MLTogether/ml-together-angular-frontend -rf
rm MLTogether/ml-together-fronted -rf
cd MLTogether/ml-together-backend
npm install
export NODE_ENV=production
npm start
