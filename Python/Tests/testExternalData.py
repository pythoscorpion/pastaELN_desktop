#!/usr/bin/python3
"""
TEST using the MINIMAL set of python-requirements, but not run on all installations
TEST IF EXTERNAL DATA CAN BE READ,...
"""
import os, shutil, traceback, time
import warnings, subprocess
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

    configName = 'pasta_tutorial'
    self.be = Pasta(configName)
    self.dirName = self.be.basePath
    self.be.exit(deleteDB=True)
    shutil.rmtree(self.dirName)
    os.makedirs(self.dirName)
    self.be = Pasta(configName, initViews=True)

    try:
      ### create some project and move into it
      self.be.addData('x0', {'-name': 'Test project1', 'objective': 'Test objective1', 'status': 'active', 'comment': '#tag1 #tag2 :field1:1: :field2:max: A random text'})
      viewProj = self.be.db.getView('viewDocType/x0')
      projID  = [i['id'] for i in viewProj][0]
      self.be.changeHierarchy(projID)

      ### add external data
      self.be.addData('measurement', {'-name': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png', 'comment': 'small'}, localCopy=True)
      print("====== STATE * ====")
      print(self.be.checkDB(verbose=False))
      self.be.addData('measurement', {'-name': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/640px-Google_2015_logo.svg.png', 'comment': 'large'})
      projDirName = self.be.basePath/self.be.cwd
      shutil.copy(self.be.softwarePath/'ExampleMeasurements/Zeiss.tif', projDirName)
      self.be.scanTree()
      print(self.be.output('measurement'))
      print(self.be.outputSHAsum())

      ### check consistency of database and replicate to global server
      print('\n*** Check this database ***')
      output = self.be.checkDB(verbose=False)
      print(output)
      self.assertTrue(output.count('**UNSURE')==0,'UNSURE string in output')
      self.assertTrue(output.count('**WARNING')==0,'WARNING string in output')
      self.assertTrue(output.count('**ERROR')==0,'ERROR string in output')
      print('\n*** DONE WITH VERIFY ***')
    except:
      print('ERROR OCCURRED IN VERIFY TESTING\n'+ traceback.format_exc() )
      raise
    return


  def tearDown(self):
    return

if __name__ == '__main__':
  unittest.main()
