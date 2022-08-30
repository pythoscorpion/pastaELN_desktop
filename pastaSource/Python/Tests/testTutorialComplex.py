#!/usr/bin/python3
"""TEST using the FULL set of python-requirements """
import os, shutil, traceback, logging, subprocess
import warnings, json
import unittest
from backend import Pasta

class TestStringMethods(unittest.TestCase):
  """
  derived class for this test
  """
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self.be = None
    self.dirName = ''

  def test_main(self):
    """
    main function
    """
    # initialization: create database, destroy on filesystem and database and then create new one
    warnings.filterwarnings('ignore', message='numpy.ufunc size changed')
    warnings.filterwarnings('ignore', message='invalid escape sequence')
    warnings.filterwarnings('ignore', category=ResourceWarning, module='PIL')
    warnings.filterwarnings('ignore', category=ImportWarning)
    warnings.filterwarnings('ignore', module='js2py')

    configName = 'pasta_tutorial'
    self.be = Pasta(configName, initConfig=False)
    self.dirName = self.be.basePath
    self.be.exit(deleteDB=True)
    shutil.rmtree(self.dirName)
    os.makedirs(self.dirName)
    self.be = Pasta(configName, initViews=True, initConfig=False)

    try:
      ### CREATE PROJECTS AND SHOW
      print('*** CREATE PROJECTS AND SHOW ***')
      self.be.addData('x0', {'-name': 'Intermetals at interfaces', \
        'objective': 'Does spray coating lead to intermetalic phase?', 'status': 'active', \
        'comment': '#intermetal #Fe #Al This is a test project'})
      self.be.addData('x0', {'-name': 'Surface evolution in tribology', \
        'objective': 'Why does the surface get rough during tribology?', 'status': 'passive', \
        'comment': '#tribology The answer is obvious'})
      self.be.addData('x0', {'-name': 'Steel', 'objective': 'Test strength of steel', 'status': 'paused', \
        'comment': '#Fe Obvious example without answer'})
      print(self.be.output('x0'))

      ### TEST PROJECT PLANING
      print('*** TEST PROJECT PLANING ***')
      viewProj = self.be.db.getView('viewDocType/x0')
      projID1  = [i['id'] for i in viewProj if i['value'][0]=='Intermetals at interfaces'][0]
      self.be.changeHierarchy(projID1)
      self.be.addData('x1',    {'comment': 'This is hard! #TODO', '-name': 'Get steel and Al-powder'})
      self.be.addData('x1',    {'comment': 'This will take a long time. #WAIT', '-name': 'Get spray machine'})
      self.be.changeHierarchy(self.be.currentID)
      self.be.addData('x2',    {'-name': 'Get quotes', 'comment': 'Dont forget company-A', 'procedure': 'Guidelines of procurement'})
      self.be.addData('x2',    {'-name': 'Buy machine','comment': 'Delivery time will be 6month'})
      self.be.changeHierarchy(None)
      self.be.addData('x1',    {'-name': 'SEM images'})
      semStepID = self.be.currentID
      self.be.changeHierarchy(semStepID)
      semDirName = self.be.basePath/self.be.cwd
      self.be.changeHierarchy(None)
      self.be.addData('x1',    {'-name': 'Nanoindentation'})
      self.be.changeHierarchy(self.be.currentID)
      indentDirName = self.be.basePath/self.be.cwd
      self.be.changeHierarchy(None)
      print(self.be.outputHierarchy())

      ### TEST PROCEDURES
      print('\n*** TEST PROCEDURES ***')
      sopDir = self.dirName/'StandardOperatingProcedures'
      os.makedirs(sopDir)
      with open(sopDir/'Nanoindentation.org','w', encoding='utf-8') as fOut:
        fOut.write('* Put sample in nanoindenter\n* Do indentation\nDo not forget to\n- calibrate tip\n- *calibrate stiffness*\n')
      with open(sopDir/'SEM.md','w', encoding='utf-8') as fOut:
        fOut.write('# Put sample in SEM\n# Do scanning\nDo not forget to\n- contact the pole-piece\n- **USE GLOVES**\n')
      self.be.addData('procedure', {'-name': 'StandardOperatingProcedures/SEM.md', 'comment': '#v1'})
      self.be.addData('procedure', {'-name': 'StandardOperatingProcedures/Nanoindentation.org', 'comment': '#v1'})
      print(self.be.output('procedure'))

      ### TEST SAMPLES
      print('*** TEST SAMPLES ***')
      self.be.addData('sample',    {'-name': 'AlFe cross-section', 'chemistry': 'Al99.9; FeMnCr ', 'qrCode': '13214124 99698708', 'comment': 'after OPS polishing'})
      print(self.be.output('sample'))
      print(self.be.outputQR())

      ###  TEST MEASUREMENTS AND SCANNING/CURATION
      print('*** TEST MEASUREMENTS AND SCANNING/CURATION ***')
      shutil.copy(self.be.softwarePath/'ExampleMeasurements/Zeiss.tif', semDirName)
      shutil.copy(self.be.softwarePath/'ExampleMeasurements/RobinSteel0000LC.txt', indentDirName)
      shutil.copy(self.be.softwarePath/'ExampleMeasurements/1500nmXX 5 7074 -4594.txt', indentDirName)
      self.be.scanTree()
      # TEST THAT LOCAL FILES/THUMBNAILS EXIST: thumbnails not created anymore
      # self.assertTrue(os.path.exists(semDirName+'Zeiss_tif_pasta.jpg'),'Zeiss PASTA not created')
      # self.assertTrue(os.path.exists(indentDirName+'1500nmXX 5 7074 -4594_txt_pasta.svg'),'Micromaterials PASTA not created')
      # self.assertTrue(os.path.exists(indentDirName+'RobinSteel0000LC_txt_pasta.svg'),'Hysitron PASTA not created')

      ### USE GLOBAL FILES
      print('*** USE GLOBAL FILES ***')
      self.be.changeHierarchy(semStepID)
      self.be.addData('measurement', {'-name': 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Misc_pollen.jpg'})
      print(self.be.output('measurement'))
      # self.assertTrue(os.path.exists(semDirName+'Misc_pollen_pasta.jpg'),'Wikipedia PASTA not created')

      ### VERIFY DATABASE INTEGRITY
      print("\n*** VERIFY DATABASE INTEGRITY ***")
      print(self.be.checkDB(verbose=True))

      ### CHANGE THOSE FILES
      # sed changing file content works
      # shasum different in any case
      print("\n*** TRY TO CHANGE THOSE FILES ***")
      cmd = ['convert',semDirName/'Zeiss.tif','-fill','white','+opaque','black',semDirName/'Zeiss.tif']
      try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=True)
      except:
        print('** COULD NOT CHANGE IMAGE Zeiss.tif')


      ### ADD OWN DATATYPE
      print('\n*** ADD OWN DATATYPE ***')
      # Update ontology
      newOntology = self.be.db.db['-ontology-']
      newOntology['my_instrument'] = [\
                {'name': '-name',   'query': 'What is the name?', 'required':True},
                {'name': 'vendor', 'query': 'What is the vendor?'},
                {'name': 'model',  'query': 'What is the model?'},
                {'name': "comment","query":"#tags comments :field:value:"},
                {'name': 'kind',   'query': 'What is the kind?', "list":["oven","SEM"]},
                {'name': 'procedure', 'query': 'What is the procedure?', "list":"procedure"},
                {'heading': 'Requirements for room'},
                {'name': 'size',   'query': 'What is the foot print area?', 'unit':'m^2'}
                ]
      newOntology.save()
      # restart
      self.be.exit()
      self.be = Pasta(configName, initViews=True, initConfig=False)
      # add data
      self.be.addData('my_instrument', {'-name': 'XP', 'vendor':'MTS', 'model':'Nanoindenter XP', 'comment':':room:10: #TODO'})
      self.be.addData('my_instrument', {'-name': 'Fischer', 'vendor':'Fischer', 'model':'Fischer Scope 300mN', 'comment':':room:12: #TODO'})
      # look at data
      print(self.be.output('my_instrument'))
      # look at one data-set
      print("One dataset")
      view = self.be.db.getView('viewDocType/my_instrument')
      for item in view:
        if item['value'][0]=='XP':
          doc = self.be.db.getDoc(item['id'])
          del doc['-branch']
          del doc['-client']
          print(doc)
      print("   room is a normal data-entry in the dataset. Machine learning can be used to add this entry into tables, without ever being told to.")
      print('\n*** DONE WITH VERIFY ***')

    except:
      print('ERROR OCCURRED IN VERIFY TESTING\n'+ traceback.format_exc() )
      raise
    return

  def tearDown(self):
    return

if __name__ == '__main__':
  unittest.main()
